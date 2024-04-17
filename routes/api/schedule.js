// Import necessary modules
import express from "express";
import { PrismaClient } from '@prisma/client';
import { updateLogData } from "../statusRoute.js";
import orders from "./orders.js";


// Initialize
const schedule = express.Router();
const prisma = new PrismaClient();


// Route for Unscheduled Orders
schedule.use('/unscheduled', orders);

////////////////////////////// Schedule ////////////////////////////////////////

schedule.get('/', async (req, res) => {
    const clientIP = req.ip;
    updateLogData("Schedule Req | IP: " + clientIP);
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

          case 'orderId': // Add case for orderId
            filter.orderId = val; // Set filter directly for orderId
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
          startTime: analysis.startTime,
          stopTime: analysis.stopTime,
        }))
      };

      const formatMeasurement = (measurement) => {
        if (!measurement) return null;

        return measurement.map((measurement) => ({
          ...measurement,
          startTime: measurement.startTime,
          stopTime: measurement.stopTime,
        }))
      };

      const formatDeliveries = (deliveries) => {
        if (!deliveries) return null;
    
        return deliveries.map((delivery) => ({
            ...delivery,
            startTime: delivery.startTime,
            stopTime: delivery.stopTime,
            measurement: formatMeasurement(delivery.measurement),
        }));
    };

      const formatOrder = (order) => ({
        ...order,
        orderTimestamp: order.orderTimestamp,
        deliveries: formatDeliveries(order.deliveries),
        analysis: formatAnalysis(order.analysis)
      });

      const formattedSchedules = schedules.map((schedule) => ({
          ...schedule,
          scheduledDate: schedule.scheduledDate,
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

//////////////// Schedule: by scheduleId ////////////////////

schedule.get('/:scheduleId', async (req, res) => {
  const { scheduleId } = req.params;
  try {
    const schedule = await prisma.schedule.findUnique({
      where: {
        orderId: scheduleId,
      },
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
            cfs: true,
            af: true,
            analysisNote: true,
          },
        },
        scheduledLine: true,
      },
    });

    
    res.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  
  }});
//////////////// Schedule: PUT ////////////////////

// Schedule: PUT
schedule.put('/:scheduleId', async (req, res) => {
  const { scheduleId } = req.params;
  const { data, ...updatedFields } = req.body; // Extract data and other updated fields
  try {
    const updateData = {};

    if (data) {
      updateData.scheduledDate = data.scheduledDate; // Assign scheduledDate from data
      updateData.scheduledHead = data.scheduledHead; // Assign scheduledHead from data
      updateData.travelTime = data.travelTime; // Assign travelTime from data
      updateData.watermasterNote = data.watermasterNote; // Assign watermasterNote from data
      updateData.specialRequest = data.specialRequest; // Assign specialRequest from data
     
      if (data.scheduledLineId) {
        updateData.scheduledLine = {
          connect: { id: data.scheduledLineId },
        }; // Assign scheduledLineId from data
      }
      if (data.order && data.order.status) {
        updateData.order = { update: { status: data.order.status } }; // Assign order status from data
      }
    }

    const updatedSchedule = await prisma.schedule.update({
      where: {
        orderId: scheduleId,
      },
      data: {
        ...updatedFields,
        ...updateData,
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