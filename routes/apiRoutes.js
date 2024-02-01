// routes/dataRoutes.js

import express from "express";
import { PrismaClient } from '@prisma/client';
import { updateLogData } from "./statusRoute.js";
import schedule from "./api/schedule.js";
import orders from "./api/orders.js";

const api = express.Router();
const prisma = new PrismaClient();
const pdtOffset = 7 * 60 * 60 * 1000;


// Function to format a date to a human-readable string in PDT
const formatDateToPDT = (date) => {
  const options = {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour12: false, // Use 24-hour notation
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  return date.toLocaleString('en-US', options);
};


////////////////////// API /////////////////////

api.get("/", async (req, res) => {
  // Add `req` parameter
  // You can add your status logic here
  const api = {
    system: "API In Development",
  };
  console.log("API Requested");
  res.json(api);
});

api.use("/schedule", schedule);
api.use("/orders", orders);
// ...

////////////////////////////////////////////////////////////////
api.get("/status", async (req, res) => {
  // Add `req` parameter
  // You can add your status logic here
  const databaseStatus = "Disconnected";
  const isTestingMode = "Development Mode";
  const mainStatus = "Loaded";
  const collectorStatus = "Not Loaded";

  const statusInfo = {
    system: [{ mode: isTestingMode }, { database: databaseStatus }],
    controllers: [
      { mainController: mainStatus },
      { collectorController: collectorStatus },
    ],
  };
  console.log("Status Requested");
  res.json(statusInfo);
});


////////////////// Order Count
  // GET order count by status types
  api.get('/ordercount/:year?', async (req, res) => {
    try {
      const { year } = req.params;
      const currentYear = year || new Date().getFullYear();
      const statusTypes = ["O", "P", "scheduled", "running", "pa", "rtp", "posted", "C", "F", "S", "A", "N"];
      const orderCounts = {};
  
      // Count orders for each status type within the specified year or current year
      for (const statusType of statusTypes) {
        const count = await prisma.Orders.count({
          where: {
            status: statusType,
            orderTimestamp: {
              gte: new Date(`${currentYear}-01-01`),
              lte: new Date(`${currentYear}-12-31T23:59:59`),
            },
          },
        });
        orderCounts[statusType] = count || 0; // Handle potential null values
      }
  
      // Create the response object with status types as keys and counts as values
      const responseObject = {
        Year: currentYear,
        Open: orderCounts['O'],
        Pending: orderCounts['P'],
        Scheduled: orderCounts['scheduled'],
        Running: orderCounts['running'],
        PendingAnalysis: orderCounts['pa'],
        ReadyToPost: orderCounts['rtp'],
        Posted: orderCounts['posted'],
        Cancelled: orderCounts['C'],
        Finalized: orderCounts['F'],
        Spread: orderCounts['S'],
        Adjusted: orderCounts['A'],
        Null: orderCounts['N'],
        TotalOrders: Object.values(orderCounts).reduce((acc, count) => acc + count, 0), // Calculate total count
      };
  
      res.json(responseObject);
    } catch (error) {
      console.error('Error fetching order counts:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });







/////////////////////////// HeadSheets //////////////////////////////////////

// GET all HeadSheets
api.get('/headsheets', async (req, res) => {
  try {
    const headsheets = await prisma.headSheets.findMany();
    res.json(headsheets);
  } catch (error) {
    console.error('Error fetching HeadSheets:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET HeadSheets by district
api.get('/headsheets/:district', async (req, res) => {
  const { district } = req.params;
  try {
    const headsheets = await prisma.headSheets.findMany({
      where: {
        district: district,
      },
    });
    if (headsheets.length === 0) {
      return res.status(404).json({ error: 'HeadSheets not found for the specified district' });
    }
    res.json(headsheets);
  } catch (error) {
    console.error('Error fetching HeadSheets:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// GET a specific HeadSheets by ID
api.get('/headsheets/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const headsheet = await prisma.headSheets.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    if (!headsheet) {
      return res.status(404).json({ error: 'HeadSheet not found' });
    }
    res.json(headsheet);
  } catch (error) {
    console.error('Error fetching HeadSheet:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST a new HeadSheets
api.post('/headsheets', async (req, res) => {
  const { name, district, maxHeads, structureRef, maxFlow, characteristics } = req.body;
  try {
    const newHeadSheet = await prisma.headSheets.create({
      data: {
        name,
        district,
        maxHeads,
        structureRef,
        maxFlow,
        characteristics: JSON.parse(characteristics), // Assuming characteristics is received as a JSON string
      },
    });
    res.json(newHeadSheet);
  } catch (error) {
    console.error('Error creating HeadSheet:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT update an existing HeadSheets by ID
api.put('/headsheets/:id', async (req, res) => {
  const { id } = req.params;
  const { name, district, maxHeads, structureRef, maxFlow, characteristics } = req.body;
  try {
    const updatedHeadSheet = await prisma.headSheets.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name,
        district,
        maxHeads,
        structureRef,
        maxFlow,
        characteristics: JSON.parse(characteristics), // Assuming characteristics is received as a JSON string
      },
    });
    res.json(updatedHeadSheet);
  } catch (error) {
    console.error('Error updating HeadSheet:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE a HeadSheets by ID
api.delete('/headsheets/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedHeadSheet = await prisma.headSheets.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.json(deletedHeadSheet);
  } catch (error) {
    console.error('Error deleting HeadSheet:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/////////////////////////// Operations Flows //////////////////////////////////////

// GET all Flows
api.get('/opsflows', async (req, res) => {
  try {
    const opsflows = await prisma.operationalFlows.findMany({
      orderBy: {
        id: 'asc', // 'asc' for ascending, 'desc' for descending
      },
    });
    res.json(opsflows);
  } catch (error) {
    console.error('Error fetching HeadSheets:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// UPDATE opsflow
api.put('/opsflows/:id', async (req, res) => {
  const { id } = req.params; // Extract id from params
  const { name, type, remoteSource, remoteValue, remoteTimestamp, override, manualValue, manualTimestamp } = req.body; // Use req.body instead of req.params for request body

  try {
    // Assuming you have a model named 'opsflows' in your Prisma schema
    const updatedOpsflow = await prisma.operationalFlows.update({
      where: {
        id: parseInt(id), // Convert id to integer
      },
      data: {
        name,
        type,
        remoteSource,
        remoteValue,
        remoteTimestamp,
        override,
        manualValue,
        manualTimestamp,
      },
    });

    res.json(updatedOpsflow); // Send the updated opsflow as the response
  } catch (error) {
    console.error('Error updating opsflow:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// POST a new opsflow
api.post('/opsflows', async (req, res) => {
  const { name, type, remoteSource } = req.body;
  try {
    const newOpsFlow = await prisma.operationalFlows.create({
      data: {
        name,
        type,
        remoteSource
      },
    });
    res.json(newOpsFlow);
  } catch (error) {
    console.error('Error Creating Flow Item:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/////////////////////////// Deliveries //////////////////////////////////////


export default api;
