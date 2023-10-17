// routes/dataRoutes.js

import express from "express";
import { PrismaClient } from '@prisma/client';
import { updateLogData } from "./statusRoute.js";


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

/////////////////////////// Orders /////////////////////////
// Orders route query handler
api.get('/orders', async (req, res) => {
  updateLogData("Data Req");
  try {
    const queryParameters = req.query;
    // Define an empty filter object
    const filter = {};

    // Function to apply a filter condition
    const applyFilter = (key, val) => {
      switch (key) {
        case 'scheduled':
          // Convert the 'val' query parameter to a boolean
          filter.scheduled = val === 'true';
          break;
          case 'order':
          case 'number':
          case 'orderNumber': // Handle 'orderNumber'
          // Encode the 'val' query parameter to handle special characters like #
          const encodedValue = encodeURIComponent(val);
          // Convert the encoded 'val' query parameter to an integer
          filter.orderNumber = parseInt(encodedValue);
          break;
        case 'serial':
        case 'serialNumber':
        case 'tcidSn':
          const serialValues = val.split(',');
          filter.tcidSn = {in: serialValues};
          break;
        case 'date':
          // Example queries: ?find:date=2023-09-01>2023-09-30 or ?find:date=2023-09-01
          // Split the 'val' into start and end dates if it contains '>'
          const dateRangePattern = /^(\d{4}-\d{2}-\d{2})>(\d{4}-\d{2}-\d{2})$/;
          const dateMatch = val.match(dateRangePattern);
          

          if (dateMatch) {
            // Date range is provided
            const [, startDate, endDate] = dateMatch;


             // Convert the 'val' query parameter to a Date object, and add the PDT offset
            filter.orderTimestamp = {
              gte: new Date(new Date(startDate).getTime() + pdtOffset),
              lte: new Date(new Date(endDate).getTime() + pdtOffset),
              // gte stands for "greater than or equal to," and it is used to specify the lower bound of the date range. In the context of a date filter, it means that the date should be greater than or equal to the specified value.
              // lte stands for "less than or equal to," and it is used to specify the upper bound of the date range. In the context of a date filter, it means that the date should be less than or equal to the specified value.
            };
          } else {
            // Single date is provided
            // Validate the date format, e.g., using a regular expression
            const datePattern = /^\d{4}-\d{2}-\d{2}$/;
            if (!datePattern.test(val)) {
              throw new Error('Invalid date format');
            }

            // Convert the 'val' query parameter to a Date object and add the PDT offset
            filter.orderTimestamp = new Date(new Date(val).getTime() + pdtOffset);
          }
          break;
        case 'status':
          // Split the 'val' into individual status values based on the specified character (or '&')
          const statusValues = val.split(','); // Use a comma as a separator, change it to your preferred character if needed
          // Use 'IN' Prisma filter to match any of the status values
          filter.status = {
            in: statusValues,
            mode: 'insensitive',
          };
          break;
          
       
        
        // Add more cases for other filter criteria as needed
        default:
          throw new Error(`Invalid filter criteria: ${key}`);
      }
    };

    // Apply filter criteria from queryParameters
    for (const key in queryParameters) {
      if (key.startsWith('find:') && queryParameters[key]) {
        const criteria = key.replace('find:', '');
        try {
          applyFilter(criteria, queryParameters[key]);
        } catch (error) {
          return res.status(400).json({ error: error.message }); // Return error response
        }
      }
    }

    // Pagination
    if (queryParameters.page && queryParameters.pageSize) {
      // Calculate the skip value based on page and pageSize
      const pageInt = parseInt(queryParameters.page);
      const pageSizeInt = parseInt(queryParameters.pageSize);
      const skip = (pageInt - 1) * pageSizeInt;

      // Add skip and take (pageSize) options to the query
      const orders = await prisma.Orders.findMany({
        where: filter,
        skip,
        take: pageSizeInt,
      });

      // Convert orderTimestamp to a human-readable format
      const formattedOrders = orders.map((order) => ({
        ...order,
        orderTimestamp: formatDateToPDT(order.orderTimestamp),
      }));

      res.json(formattedOrders);
    } else {
      // If page and pageSize are not provided, return all results
      const orders = await prisma.Orders.findMany({
        where: filter,
      });

      // Convert orderTimestamp to a human-readable format
      const formattedOrders = orders.map((order) => ({
        ...order,
        orderTimestamp: formatDateToPDT(order.orderTimestamp),
      }));

      res.json(formattedOrders);
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


///////////////////////////////////// Status ////////////////////////////////////////////////

api.get('/orders/:status', async (req, res) => {
  const { status } = req.params;
  const statuses = status.split('&');

  // Define an array to store positive filters
  let positiveFilters = [];

  // Iterate through the provided statuses and build the filter object
  statuses.forEach((status) => {
    const filterCondition = {
      status: {
        contains: status,
        mode: 'insensitive',
      },
    };
    positiveFilters.push(filterCondition);
  });

  let whereCondition = {};

  // Combine positive filters with logical OR operation
  if (positiveFilters.length > 0) {
    whereCondition.OR = positiveFilters;
  }

  try {
    // Retrieve and return filtered orders using Prisma
    const orders = await prisma.Orders.findMany({
      where: whereCondition,
    });

    // Convert orderTimestamp to a human-readable format
    const formattedOrders = orders.map((order) => ({
      ...order,
      orderTimestamp: formatDateToPDT(order.orderTimestamp),
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});










export default api;
