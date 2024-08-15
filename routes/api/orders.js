// Import necessary modules
import express from "express";
import { PrismaClient } from '@prisma/client';
import { updateLogData } from "../statusRoute.js";


// Initialize
const orders = express.Router();
const prisma = new PrismaClient();
const pdtOffset = 7 * 60 * 60 * 1000;

// Function to format a date to a human-readable string in PDT
const formatToLocalTime = (date) => {
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

/////////////////////////// Orders /////////////////////////
// Orders route query handler
orders.get('/', async (req, res) => {
    const clientIP = req.ip;
    updateLogData("Data Req | IP: " + clientIP);
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

            const totalCount = await prisma.orders.count({
              where: filter,
            });
          
            const totalPages = Math.ceil(totalCount / pageSizeInt);
    
            // Add skip and take (pageSize) options to the query
            const orders = await prisma.orders.findMany({
            where: filter,
            include: {
              schedule: true,
            },
            skip,
            take: pageSizeInt,
            });
    
            // Convert orderTimestamp to a human-readable format
            const formattedOrders = orders.map((order) => ({
            ...order,
            orderTimestamp: formatToLocalTime(order.orderTimestamp),
            }));

            const response = {
              metadata: {
                  totalPages,
                  totalCount,
              },
              orders: formattedOrders,
               // Your existing data
            };
    
            res.json(response);
        } else {
            // If page and pageSize are not provided, return all results
            const orders = await prisma.orders.findMany({
            where: filter,
            include: {
              schedule: true,
            },
            });
    
            // Convert orderTimestamp to a human-readable format
            const formattedOrders = orders.map((order) => ({
            ...order,
            orderTimestamp: formatToLocalTime(order.orderTimestamp),
            }));
    
            res.json(formattedOrders);
        }
        } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        }
  }
);
  
  orders.get('/:orderId', async (req, res) => {
    const { orderId } = req.params;
    try {
      // Retrieve the order by orderId from the database
      const order = await prisma.orders.findUnique({
        where: {
          id: orderId,
        },
        include: {
          schedule: true,
        },
      });
  
      // If the order does not exist, return a 404 Not Found response
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  })
  
  /////////// Orders: Put Functions //////////////////////////////////
  orders.put('/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const { 
      status, 
    } = req.body.data;
  
    try {
      console.log('Updating order. ID:', orderId, 'New Status:', status);
  
      const updatedOrder = await prisma.orders.update({
          where: {
              id: orderId,
          },
          data: {
              status,
          },
      });
  
      console.log('Updated Order:', updatedOrder);
      res.json(updatedOrder);
  } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
  });
  

  export default orders;