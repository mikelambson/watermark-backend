import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';
import { convertUSGSToUTC } from '../utils/timestampUtils.js';

const prisma = new PrismaClient();
const MAX_DB_RETRIES = 5;
const DB_RETRY_DELAY = 6000; // 60 seconds if DB is down
const NORMAL_CYCLE_DELAY = 900000; // 15 minutes when running normally

let currentCycleDelay = NORMAL_CYCLE_DELAY; // Start with normal timing

/**
 * Attempts a database query with retry logic
 * @param {Function} queryFunction - The Prisma query function
 * @param {string} actionDescription - A description of the action (for logging)
 * @returns {Promise<any>} - Query result or null if failed
 */
async function attemptDbQuery(queryFunction, actionDescription) {
    let attempts = 0;
    while (attempts < MAX_DB_RETRIES) {
        try {
            console.log(`🔍 Attempting: ${actionDescription} (Attempt ${attempts + 1}/${MAX_DB_RETRIES})`);
            const result = await queryFunction();
            console.log(`✅ Success: ${actionDescription}`);
            currentCycleDelay = NORMAL_CYCLE_DELAY; // Reset delay to normal on success
            return result;
        } catch (error) {
            console.error(`❌ Database error on ${actionDescription}:`, error.message);
            attempts++;
            if (attempts < MAX_DB_RETRIES) {
                console.log(`🔄 Retrying in ${DB_RETRY_DELAY / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, DB_RETRY_DELAY));
            }
        }
    }
    console.error(`🚨 All retries failed: ${actionDescription}. Reducing cycle delay.`);
    currentCycleDelay = Math.min(DB_RETRY_DELAY * 5, NORMAL_CYCLE_DELAY / 3); // Reduce cycle time
    return null;
}

if (isMainThread) {
    async function startIngestion() {
        while (true) {
            console.log(`🚀 Starting new ingestion cycle (Next in ${currentCycleDelay / 1000} sec)...`);

            // Fetch meter ingestion sources, retry if necessary
            const sources = await attemptDbQuery(() => prisma.meterIngestion.findMany({ where: { active: true } }), 
                                                 "Fetch active meter ingestion sources");

            if (!sources || sources.length === 0) {
                console.log("⚠️ No active ingestion sources found. Skipping this cycle.");
                await new Promise(resolve => setTimeout(resolve, currentCycleDelay));
                continue;
            }

            console.log(`🔄 Starting ingestion for ${sources.length} meters...`);

            const workers = sources.map(source => {
                return new Promise((resolve, reject) => {
                    const worker = new Worker(__filename, { workerData: source });

                    worker.on("message", resolve);
                    worker.on("error", reject);
                    worker.on("exit", (code) => {
                        if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
                    });
                });
            });

            await Promise.all(workers).catch((error) => console.error("❌ Worker process error:", error));

            console.log(`✅ Ingestion cycle complete. Next cycle in ${currentCycleDelay / 1000} seconds.`);
            await new Promise(resolve => setTimeout(resolve, currentCycleDelay));
        }
    }

    startIngestion();
} else {
    (async () => {
        try {
            const { meterId, sourceUrl } = workerData;

            // Fetch raw data
            const response = await fetch(sourceUrl);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

            const rawData = await response.text();
            const lines = rawData.split("\n").filter(line => !line.startsWith("#"));

            // Extract timestamp & measurement columns
            const readings = lines.map(line => {
                const parts = line.split(/\s+/);
                const rawTimestamp = `${parts[2]} ${parts[3]}`; // USGS datetime + timezone
                const utcTimestamp = convertUSGSToUTC(rawTimestamp);

                if (!utcTimestamp) return null; // Skip invalid timestamps

                return {
                    timestamp: utcTimestamp,
                    meterId: meterId,
                    value: parseFloat(parts[4]) // Measurement column
                };
            }).filter(Boolean); // Remove null values

            // Store readings in the database with retry logic
            const success = await attemptDbQuery(
                () => prisma.meterMeasurements.createMany({ data: readings }),
                `Store ${readings.length} readings for meter ${meterId}`
            );

            if (!success) {
                console.error(`🚨 Failed to store readings for meter ${meterId}, moving on.`);
            } else {
                console.log(`✅ Successfully stored readings for meter ${meterId}`);
            }

            parentPort.postMessage("done");
        } catch (error) {
            console.error(`❌ Error processing meter ${workerData.meterId}:`, error);
            parentPort.postMessage("error");
        }
    })();
}
