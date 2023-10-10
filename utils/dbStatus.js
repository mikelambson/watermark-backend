import { updateLogData } from "../routes/statusRoute.js";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseConnection() {
  try {
    
    await prisma.$connect();
    updateLogData('DATABASE CONNECTION ESTABLISHED SUCCESSFULLY')
    console.log('Database connection established successfully.');
  } catch (error) {
    updateLogData('Error connecting to the database:', error)
    console.error('Error connecting to the database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

export { checkDatabaseConnection };