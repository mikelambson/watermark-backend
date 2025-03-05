import { PrismaClient } from '@prisma/client';

// Create a Prisma client instance
const prisma = new PrismaClient();

async function deleteAllLegacyOrders() {
  try {
    // Use Prisma query to delete all data from the LegacyOrders table
    await prisma.Orders.deleteMany({});
    console.log('All data deleted from LegacyOrders table.');
  } catch (error) {
    console.error('Error deleting data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Call the deleteAllLegacyOrders function
deleteAllLegacyOrders();
