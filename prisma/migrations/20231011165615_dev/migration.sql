/*
  Warnings:

  - The `watermasterNote` column on the `Schedule` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ops"."HeadSheets" ADD COLUMN     "structureRef" TEXT;

-- AlterTable
ALTER TABLE "ops"."Schedule" ADD COLUMN     "specialRequest" TEXT,
ADD COLUMN     "travelTime" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "watermasterNote",
ADD COLUMN     "watermasterNote" JSONB;

-- CreateTable
CREATE TABLE "ops"."Deliveries" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "stopTime" TIMESTAMP(3),
    "deliveryNote" TEXT,

    CONSTRAINT "Deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ops"."Measurements" (
    "id" SERIAL NOT NULL,
    "deliveryId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "stopTime" TIMESTAMP(3),
    "measurement" INTEGER NOT NULL,
    "measurementType" TEXT NOT NULL DEFAULT 'estimation',
    "measurementNote" TEXT,

    CONSTRAINT "Measurements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ops"."Deliveries" ADD CONSTRAINT "Deliveries_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "legacy"."LegacyOrders"("orderNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."Measurements" ADD CONSTRAINT "Measurements_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "ops"."Deliveries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
