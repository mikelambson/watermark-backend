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
      
            // If date range is provided, convert it to Date objects and apply PDT offset
            if (dateMatch) {
              const [, startDate, endDate] = dateMatch;
              filter.orderTimestamp = {
                gte: new Date(new Date(startDate).getTime() + pdtOffset),
                lte: new Date(new Date(endDate).getTime() + pdtOffset),
              };
            } else {
              // Single date is provided or no date is provided (defaults to current year)
              const parsedDate = new Date(val);
              if (isNaN(parsedDate)) {
                // If no valid date is provided, default to the current year
                const currentYear = new Date().getFullYear();
                filter.orderTimestamp = {
                  gte: new Date(`${currentYear}-01-01T00:00:00Z`),
                  lte: new Date(`${currentYear}-12-31T23:59:59Z`),
                };
              } else {
                // If a valid single date is provided, use it for filtering
                filter.orderTimestamp = new Date(parsedDate.getTime() + pdtOffset);
              }
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
        case 'district':
          // Split the 'val' into individual status values based on the specified character (or '&')
          const districtValues = val.split(','); // Use a comma as a separator, change it to your preferred character if needed
          // Use 'IN' Prisma filter to match any of the status values
          filter.district = {
            in: districtValues,
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


//////////// Order: Status 

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
      orderTimestamp: {
        gte: new Date(`${new Date().getFullYear()}-01-01T00:00:00Z`),  // Start of the current year
        lte: new Date(`${new Date().getFullYear()}-12-31T23:59:59Z`),  // End of the current year
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




/////////// Orders: Put Functions 

api.put('/orders/:orderNumber/:year?', async (req, res) => {
  const { year, orderNumber } = req.params;
  const { newStatus } = req.body;

  // If year is not provided, default to the current year
  const currentYear = year || new Date().getFullYear().toString();

  try {
    // Retrieve the order by orderId and year from the database
    const order = await prisma.orders.findMany({
      where: {
        AND: [
          { orderNumber: parseInt(orderNumber) },
          {
            orderTimestamp: {
              gte: new Date(`${currentYear}-01-01T00:00:00Z`),  // Start of the specified year
              lte: new Date(`${currentYear}-12-31T23:59:59Z`),  // End of the specified year
            },
          },
        ],
      },
    });

    // If the order does not exist, return a 404 Not Found response
    if (!order || order.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update the order status with the newStatus provided in the request body
    const updatedOrder = await prisma.orders.updateMany({
      where: {
        AND: [
          { orderNumber: parseInt(orderNumber) },
          {
            orderTimestamp: {
              gte: new Date(`${currentYear}-01-01T00:00:00Z`),  // Start of the specified year
              lte: new Date(`${currentYear}-12-31T23:59:59Z`),  // End of the specified year
            },
          },
        ],
      },
      data: {
        status: newStatus,
      },
    });

    // Return the updated order as the response
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});


////////////////////////////// Schedule ////////////////////////////////////////

// Schedule: GET
api.get('/schedule', async (req, res) => {
  try {
    // Step 1: Select Order Numbers from Current Year
    const currentYear = new Date().getFullYear();
    const orders = await prisma.orders.findMany({
      where: {
        orderTimestamp: {
          gte: new Date(`${currentYear}-01-01T00:00:00Z`),
          lte: new Date(`${currentYear}-12-31T23:59:59Z`),
        },
      },
    });

    // Step 2: Filter by Specific District
    const { district } = req.query;
    const filteredByDistrict = district
      ? orders.filter((order) => order.district === district)
      : orders;

    // Step 3: Filter by Scheduled Line
    const { scheduledLine } = req.query;
    const filteredByLine = scheduledLine
      ? filteredByDistrict.filter((order) => order.scheduledLine === scheduledLine)
      : filteredByDistrict;

    // Step 4: Filter by Scheduled Head (with Drop-In Check)
    const { scheduledHead, dropIn } = req.query;
    const filteredByHead = scheduledHead
      ? filteredByLine.filter((order) => (dropIn === 'true' ? !order.scheduledHead : order.scheduledHead === scheduledHead))
      : filteredByLine;

    // Convert timestamps to local time before sending the response
    const formattedSchedules = filteredByHead.map((schedule) => ({
      ...schedule,
      scheduledDate: formatDateToPDT(new Date(schedule.scheduledDate.getTime() + pdtOffset)),
    }));

    // Return the final filtered schedules
    res.json(formattedSchedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

////////////// Schedule: POST

// Schedule: POST
api.post('/schedule', async (req, res) => {
  try {
    const { orderId, scheduledDate, scheduledLine, scheduledHead, travelTime, dropIn, instructions, watermasterNote, specialRequest } = req.body;

    // Convert scheduledDate to UTC before storing in the database
    const utcScheduledDate = new Date(scheduledDate);
    // Apply PDT offset
    utcScheduledDate.setTime(utcScheduledDate.getTime() + pdtOffset);

    const newSchedule = await prisma.schedule.create({
      data: {
        orderId,
        scheduledDate: utcScheduledDate,
        scheduledLine,
        scheduledHead,
        travelTime,
        dropIn,
        instructions,
        watermasterNote,
        specialRequest,
      },
    });

    res.json(newSchedule);
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//////////////// Schedule: PUT

// Schedule: PUT
api.put('/schedule/:scheduleId', async (req, res) => {
  const { scheduleId } = req.params;

  try {
    const { scheduledDate, scheduledLine, scheduledHead, travelTime, dropIn, instructions, watermasterNote, specialRequest } = req.body;

    // Convert scheduledDate to UTC before updating in the database
    const utcScheduledDate = new Date(scheduledDate);
    // Apply PDT offset
    utcScheduledDate.setTime(utcScheduledDate.getTime() + pdtOffset);

    const updatedSchedule = await prisma.schedule.update({
      where: {
        id: parseInt(scheduleId),
      },
      data: {
        scheduledDate: utcScheduledDate,
        scheduledLine,
        scheduledHead,
        travelTime,
        dropIn,
        instructions,
        watermasterNote,
        specialRequest,
      },
    });

    res.json(updatedSchedule);
  } catch (error) {
    console.error('Error updating schedule:', error);
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

/////////////////////////// Deliveries //////////////////////////////////////


export default api;
