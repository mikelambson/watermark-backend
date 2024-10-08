import fs from 'fs';
import parse from 'papaparse';
import { PrismaClient } from '@prisma/client';

const csvFilePath = './seeder/scheduling.csv';

// Main function to parse CSV, transform data, and seed the database
async function main() {
  try {
    // Read CSV file
    const data = fs.readFileSync(csvFilePath, 'utf8');

    // Parse CSV data
    const parsedData = parse.parse(data, {
      header: true,
      delimiter: ',',
      quoteChar: '"',
    });

    const prisma = new PrismaClient();

    try {
      // Initialize counters for different types of errors
      let rowsInserted = 0;
      let invalidDateOrTimeErrors = 0;
      let skippedDuplicate = 0;
      let missingOrderNumberErrors = 0; // Track missing order numbers

      for (const row of parsedData.data) {
        try {
          const orderNumber = parseInt(row.ORDER_NO);

          // Check if the order number is missing or invalid
          if (isNaN(orderNumber)) {
            // Log the error for a missing or invalid orderNumber
            console.error('Invalid `prisma.Orders.findUnique()` invocation:');
            console.error('{\n  where: {\n    orderNumber: Int\n  }\n}\n\nArgument `orderNumber` is missing.');
            missingOrderNumberErrors++;
            continue;
          }

          // Check if the order number already exists in the database
          const existingOrder = await prisma.Orders.findUnique({
            where: { orderNumber },
          });

          if (existingOrder) {
            // If the order already exists, skip it
            skippedDuplicate++;
            continue;
          }

          const orderDate = parseInt(row.ORDER_DATE);
          const orderTime = parseFloat(row.ORDER_TIME);

          // Check if the conversion is successful before creating the Date object
          if (!isNaN(orderDate) && !isNaN(orderTime)) {
            const pdtOffset = 7 * 60 * 60 * 1000; // Offset for PDT (UTC-07:00) in milliseconds
            const orderTimestamp = new Date(((orderDate - 25569) * 86400000 + orderTime * 86400000) + pdtOffset);

            // Make sure orderTimestamp is a valid Date object
            if (!isNaN(orderTimestamp.getTime())) {
              const transformedRow = {
                orderTimestamp,
                orderNumber,
                tcidSn: row.TCID_SN,
                district: row.DISTRICT,
                status: row.ADJUST,
                laterals: [row["LATERAL 1"], row["LATERAL 2"], row["LATERAL 3"], row["LATERAL 4"]].filter(Boolean), // Combine laterals into an array
                approxCfs: parseFloat(row.APPROX_CFS),
                approxHrs: parseFloat(row.APPROX_HRS),
                phoneNumbers: [row.PHONE_NO, row.Phone_NO_2, row.Phone_NO_3].filter(Boolean), // Combine 
                remarks: row.REMARKS,
                details: {
                  irrigatorsName: row["Irrigator's Name"],
                  ownersName: row["Owner's Name"],
                  name: row.NAME,
                  approxAf: parseFloat(row.APPROX_AF),
                  balance: parseFloat(row.Balance),
                }
              };

              // Insert the transformed row into the database
              await prisma.Orders.create({
                data: transformedRow,
              });
              rowsInserted++; // Update the count of successful rows inserted
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
      console.log(`Rows skipped due to duplicate orderNumber: ${skippedDuplicate}`);
      console.log(`Rows with missing or invalid orderNumber: ${missingOrderNumberErrors}`);
    } catch (err) {
      console.error('Error inserting data:', err);
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Call the main function
main();
