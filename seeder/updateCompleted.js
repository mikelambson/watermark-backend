import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateScheduled() {
  try {
    // Query for Orders where status is not "O"
    const ordersToUpdate = await prisma.Orders.findMany({
      where: {
        status: {
          not: 'O',
        },
      },
    });

    // Update the scheduled field to true for each record
    const updatePromises = ordersToUpdate.map((order) => {
      return prisma.Orders.update({
        where: {
          id: order.id, // Assuming you have an id field
        },
        data: {
          scheduled: true,
        },
      });
    });

    // Execute all the update queries
    await Promise.all(updatePromises);

    console.log('Orders updated successfully.');
  } catch (error) {
    console.error('Error updating Orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateScheduled();
