import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateOrdersAndCreateSchedule() {
  try {
    // Find all orders with status "P"
    const ordersToUpdate = await prisma.orders.findMany({
      where: {
        status: "P",
      },
    });

    // Loop through each order and update
    for (const order of ordersToUpdate) {
      // Update the order
      await prisma.orders.update({
        where: {
          id: order.id,
        },
        data: {
          // Update any fields you need in the orders table
          // For example:
          // newField: "newValue",
        },
      });

      // Create corresponding schedule entry for the updated order
      await prisma.schedule.create({
        data: {
          
          // Add other fields as needed
          order: {
            connect: {
              id: order.id,
            },
          },
        },
      });
    }

    console.log('Orders updated and schedule entries created successfully.');
  } catch (error) {
    console.error('Error updating orders and creating schedule entries:', error);
  } finally {
    // Close the Prisma client
    await prisma.$disconnect();
  }
}

// Call the function to update orders and create schedule entries
updateOrdersAndCreateSchedule();
