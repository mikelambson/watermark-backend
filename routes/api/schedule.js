// Import necessary modules
import express from "express";
import { PrismaClient } from '@prisma/client';
import { updateLogData } from "../statusRoute.js";
import orders from "./orders.js";


// Initialize
const schedule = express.Router();
const prisma = new PrismaClient();

// Functions
const formatToLocalTime = (timestamp) => {
  if (!timestamp) return timestamp;
  return timestamp.toLocaleString();
};

    // Convert timestamps to local time



// Route for Unscheduled Orders
schedule.use('/unscheduled', orders, );

schedule.get('/', async (req, res) => {
    try{
      const schedules = await prisma.Schedule.findMany({
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
              deliveries: {
                select: {
                id: true,
                startTime: true,
                stopTime: true,
                measurement: true,
                deliveryNote: true,
                },
              },
            },
          },
          scheduledLine: true,
        },
      });

      const formatMeasurement = (measurement) => {
        if (!measurement) return null;

        return measurement.map((measurement) => ({
          ...measurement,
          startTime: measurement.startTime.toLocaleString(),
          stopTime: measurement.stopTime.toLocaleString(),
        }))
      };

      const formatDeliveries = (deliveries) => {
        if (!deliveries) return null;
        
        
        return deliveries.map((delivery) => ({
            ...delivery,
            startTime: delivery.startTime.toLocaleString(),
            stopTime: delivery.stopTime?.toLocaleString(),
            measurement: formatMeasurement(deliveries.measurement),
        }));
      };

      const formatOrder = (order) => ({
        ...order,
        orderTimestamp: order.orderTimestamp.toLocaleString(),
        deliveries: formatDeliveries(order.deliveries)
      });

      const formattedSchedules = schedules.map((schedule) => ({
          ...schedule,
          scheduledDate: schedule.scheduledDate.toLocaleString(),
          order: formatOrder(schedule.order),
      }));

  res.json(formattedSchedules);
  } catch (error) {
    console.error('Error fetching scheduled orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

////////////////////////////// Schedule ////////////////////////////////////////

// Schedule: GET
// Route for Scheduled Orders
schedule.get('/scheduled', async (req, res) => {
    updateLogData("Data Req");
  try {
    const { district, headsheet, head, line } = req.query;

    // Construct Prisma query for Scheduled Orders
    const scheduledOrders = await prisma.orders.findMany({
      where: {
        district,
        headsheet,
        headTab: head,
        status: {
          in: ['scheduled', 'running'],
        },
        line,
      },
      // Include other necessary tables as needed
      include: {
        Schedule: true,
        ScheduleNotes: true,
      },
    });

    // Respond with the fetched Scheduled Orders
    res.json({ scheduledOrders });
  } catch (error) {
    console.error('Error fetching scheduled orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


////////////// Schedule: POST

// Schedule: POST
schedule.post('/schedule', async (req, res) => {
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

// Export the schedule
export default schedule;
