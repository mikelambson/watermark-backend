import { PrismaClient } from '@prisma/client';
import staticData from './Static.json' assert {type: 'json'};

const prisma = new PrismaClient();

async function seedTable(tableName, data) {
  try {
    const model = prisma[tableName]; // Prisma models use camel case names
    
    for (const rowData of data) {
      await model.create({
        data: rowData,
      });
      console.log(`${tableName} created: ${JSON.stringify(rowData)}`);
    }
  } catch (error) {
    console.error(`Error seeding ${tableName}:`, error);
  }
}

// Loop through staticData object and seed corresponding tables dynamically
for (const tableName in staticData) {
  if (Object.hasOwnProperty.call(staticData, tableName) && tableName !== "dummyTable") {
    const tableData = staticData[tableName];
    seedTable(tableName, tableData);
}}

await prisma.$disconnect();
