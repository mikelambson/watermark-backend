import { PrismaClient } from '@prisma/client';
import staticData from './Static.json' assert {type: 'json'};

const prisma = new PrismaClient();

async function seedTable(tableName, data) {
  try {
    const model = prisma[tableName]; // Dynamically access the Prisma model based on tableName

    // Check if the table is empty
    const recordCount = await model.count();

    if (recordCount > 0) {
      console.log(`${tableName} already contains data. Skipping seeding.`);
      return; // Skip the seeding for this table
    }

    // If the table is empty, proceed with seeding
    for (const rowData of data) {
      await model.create({
        data: rowData,
      });
      console.log(`${tableName} created: ${JSON.stringify(rowData)}`);
    }
    console.log(`${tableName} seeding completed.`);
    
  } catch (error) {
    console.error(`Error seeding ${tableName}:`, error);
  }
}

// Loop through staticData object and seed corresponding tables dynamically
async function seedDatabase() {
  for (const tableName in staticData) {
    if (Object.hasOwnProperty.call(staticData, tableName) && tableName !== "dummyTable") {
      const tableData = staticData[tableName];
      await seedTable(tableName, tableData);
    }
  }
  await prisma.$disconnect();
}

// Start the seeding process
seedDatabase();

