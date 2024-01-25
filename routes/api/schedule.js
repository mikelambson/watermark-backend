// Import necessary modules
import express from "express";
import { PrismaClient } from '@prisma/client';
import { updateLogData } from "../statusRoute.js";
import orders from "./orders.js";


// Initialize
const schedule = express.Router();
const prisma = new PrismaClient();

// Functions
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

// Route for Unscheduled Orders
schedule.use('/unscheduled', orders);

////////////////////////////// Schedule ////////////////////////////////////////

schedule.get('/', async (req, res) => {

    try{
      const queryParameters = req.query;
      // Define an empty filter object
      const filter = {};
      // Function to apply a filter condition
      const applyFilter = (key, val) => {
        switch (key) {
          case 'district':
            const districtValues = val.split(','); // Split the values if multiple districts are provided
            if (!filter.order) {
                filter.order = {}; // Initialize the order object if it doesn't exist
            }
            filter.order.district = {
                in: districtValues,
                mode: 'insensitive',
            };
            break;
          
          case 'line': // Handle 'scheduledLine'
            const lineValues = val.split(',');
            if (!filter.scheduledLine) {
              filter.scheduledLine = {}; // Initialize the order object if it doesn't exist
            }
            if (!isNaN(val)) {
              // If val is a number, set filter.scheduledLine.id
              filter.scheduledLine.id = parseInt(val);
            } else {
              // If val is not a number, set filter.scheduledLine.name
              filter.scheduledLine.name = {
                  in: lineValues,
                  mode: 'insensitive',
              };
            }
            break;

          case 'status':
             // Split the 'val' into individual status values based on the specified character (or '&')
            const statusValues = val.split(','); // Use a comma as a separator, change it to your preferred character if needed
            if (!filter.order) {
                filter.order = {}; // Initialize the order object if it doesn't exist
            }
            filter.order.status = {
                in: statusValues,
                mode: 'insensitive',
            };
            break;
          
          case 'head':
            filter.scheduledHead = parseInt(val)
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

      const schedules = await prisma.Schedule.findMany({
        where: filter,
        include: {
          order: {
            select: {
              id: true,
              orderTimestamp: true,
              orderNumber: true,
              tcidSn: true,
              district: true,
              status: true,
              laterals: true,
              approxCfs: true,
              approxHrs: true,
              phoneNumbers: true,
              remarks: true,
              details: true,
            }, 
          },
          deliveries: {
            select: {
            id: true,
            startTime: true,
            stopTime: true,
            measurement: true,
            deliveryNote: true,
            },
          },
          analysis: {
            select: {
              id: true,
              startTime: true,
              stopTime: true,
              cfs:true,
              af: true,
              analysisNote: true,
            },
          },
          scheduledLine: true,
        },
      });

      const formatAnalysis = (analysis) => {
        if (!analysis) return null;

        return analysis.map((analysis) => ({
          ...analysis,
          startTime: formatToLocalTime(analysis.startTime),
          stopTime: formatToLocalTime(analysis.stopTime),
        }))
      };

      const formatMeasurement = (measurement) => {
        if (!measurement) return null;

        return measurement.map((measurement) => ({
          ...measurement,
          startTime: formatToLocalTime(measurement.startTime),
          stopTime: formatToLocalTime(measurement.stopTime),
        }))
      };

      const formatDeliveries = (deliveries) => {
        if (!deliveries) return null;
        
        
        return deliveries.map((delivery) => ({
            ...delivery,
            startTime: formatToLocalTime(delivery.startTime),
            stopTime: formatToLocalTime(delivery.stopTime),
            measurement: formatMeasurement(deliveries.measurement),
        }));
      };

      const formatOrder = (order) => ({
        ...order,
        orderTimestamp: formatToLocalTime(order.orderTimestamp),
        deliveries: formatDeliveries(order.deliveries),
        analysis: formatAnalysis(order.analysis)
      });

      const formattedSchedules = schedules.map((schedule) => ({
          ...schedule,
          scheduledDate: formatToLocalTime(schedule.scheduledDate),
          order: formatOrder(schedule.order),
      }));

  res.json(formattedSchedules);
  } catch (error) {
    console.error('Error fetching scheduled orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

////////////// Schedule: POST ////////////

// Schedule: POST
schedule.post('/schedule', async (req, res) => {
  try {
    const { orderId, scheduledDate, scheduledLine, scheduledHead, travelTime, dropIn, instructions, watermasterNote, specialRequest } = req.body;

    // Convert scheduledDate to UTC before storing in the database
    const utcScheduledDate = new Date(scheduledDate);
    // Apply PDT offset
    utcScheduledDate.setTime(utcScheduledDate.getTime());

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

//////////////// Schedule: PUT ////////////////////

// Schedule: PUT
schedule.put('/schedule/:scheduleId', async (req, res) => {
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

// Export the schedule
export default schedule;
