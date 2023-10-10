import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateScheduled() {
  try {
    // Query for LegacyOrders where adjust is not "O"
    const legacyOrdersToUpdate = await prisma.legacyOrders.findMany({
      where: {
        adjust: {
          not: 'O',
        },
      },
    });

    // Update the scheduled field to true for each record
    const updatePromises = legacyOrdersToUpdate.map((legacyOrder) => {
      return prisma.legacyOrders.update({
        where: {
          id: legacyOrder.id, // Assuming you have an id field
        },
        data: {
          scheduled: true,
        },
      });
    });

    // Execute all the update queries
    await Promise.all(updatePromises);

    console.log('LegacyOrders updated successfully.');
  } catch (error) {
    console.error('Error updating LegacyOrders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateScheduled();
