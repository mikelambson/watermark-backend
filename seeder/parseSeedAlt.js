import fs from 'fs';
import parse from 'papaparse';
import { PrismaClient } from '@prisma/client';

const csvFilePath = './scheduling.csv';

// Main function to parse CSV, transform data, and seed the database
async function main() {
  const prisma = new PrismaClient();

  try {
    // Read CSV file
    const data = fs.readFileSync(csvFilePath, 'utf8');

    // Parse CSV data
    const parsedData = parse.parse(data, {
      header: true,
      delimiter: ',',
      quoteChar: '"',
    });

    // Initialize counters for different types of errors
    let rowsInserted = 0;
    let invalidDateOrTimeErrors = 0;
    let skippedDuplicate = 0;

    for (const row of parsedData.data) {
      try {
        const orderDate = parseInt(row.ORDER_DATE);
        const orderTime = parseFloat(row.ORDER_TIME);

        // Check if the conversion is successful before creating the Date object
        if (!isNaN(orderDate) && !isNaN(orderTime)) {
          const pdtOffset = 7 * 60 * 60 * 1000; // Offset for PDT (UTC-07:00) in milliseconds
          const orderTimestamp = new Date(((orderDate - 25569) * 86400000 + orderTime * 86400000) + pdtOffset);

          // Make sure orderTimestamp is a valid Date object
          if (!isNaN(orderTimestamp.getTime())) {
            const orderNumber = parseInt(row.ORDER_NO);

            // Check if the order number is valid
            if (!isNaN(orderNumber)) {
              const existingOrder = await prisma.orders.findFirst({
                where: {
                  orderNumber,
                  orderTimestamp,
                },
              });

              if (existingOrder) {
                // If the order already exists, skip it
                skippedDuplicate++;
                continue;
              }

              const transformedRow = {
                orderTimestamp,
                orderNumber,
                tcidSn: row.TCID_SN,
                district: row.DISTRICT,
                status: row.ADJUST,
                laterals: [row["LATERAL 1"], row["LATERAL 2"], row["LATERAL 3"], row["LATERAL 4"]].filter(Boolean), // Combine laterals into an array
                approxCfs: parseFloat(row.APPROX_CFS),
                approxHrs: parseFloat(row.APPROX_HRS),
                phoneNumbers: [row.PHONE_NO, row.Phone_NO_2, row.Phone_NO_3].filter(Boolean), // Combine phone numbers into an array
                remarks: row.REMARKS,
                details: {
                  irrigatorsName: row["Irrigator's Name"],
                  ownersName: row["Owner's Name"],
                  name: row.NAME,
                  approxAf: parseFloat(row.APPROX_AF),
                  balance: parseFloat(row.Balance),
                },
              };

              // Insert the transformed row into the database
              await prisma.orders.create({
                data: transformedRow,
              });
              rowsInserted++; // Update the count of successful rows inserted
            } else {
              // Handle invalid orderNumber
              console.error('Invalid orderNumber:', row.ORDER_NO);
            }
          } else {
            invalidDateOrTimeErrors++;
          }
        } else {
          invalidDateOrTimeErrors++;
        }
      } catch (error) {
        // Log any errors for individual rows
        console.error('Error processing row:', error);
      }
    }

    console.log(`Rows inserted: ${rowsInserted}`);
    console.log(`Rows with invalid date or time: ${invalidDateOrTimeErrors}`);
    console.log(`Rows skipped due to duplicate orderNumber and orderTimestamp: ${skippedDuplicate}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Call the main function
main();
