/*
  Warnings:

  - You are about to drop the column `orderId` on the `OrderAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `Callouts` table. All the data in the column will be lost.
  - The primary key for the `Deliveries` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Deliveries` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Measurements` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Measurements` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Schedule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dropIn` on the `Schedule` table. All the data in the column will be lost.
  - The primary key for the `Orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `scheduleId` to the `OrderAnalysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduleId` to the `Callouts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduleId` to the `Deliveries` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `deliveryId` on the `Measurements` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `orderId` on the `Schedule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "analysis"."OrderAnalysis" DROP CONSTRAINT "OrderAnalysis_orderId_fkey";

-- DropForeignKey
ALTER TABLE "ops"."Callouts" DROP CONSTRAINT "Callouts_orderId_fkey";

-- DropForeignKey
ALTER TABLE "ops"."Deliveries" DROP CONSTRAINT "Deliveries_orderId_fkey";

-- DropForeignKey
ALTER TABLE "ops"."Measurements" DROP CONSTRAINT "Measurements_deliveryId_fkey";

-- DropForeignKey
ALTER TABLE "ops"."Schedule" DROP CONSTRAINT "Schedule_orderId_fkey";

-- AlterTable
ALTER TABLE "analysis"."OrderAnalysis" DROP COLUMN "orderId",
ADD COLUMN     "scheduleId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "ops"."Callouts" DROP COLUMN "orderId",
ADD COLUMN     "scheduleId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "ops"."Deliveries" DROP CONSTRAINT "Deliveries_pkey",
ADD COLUMN     "scheduleId" UUID NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ALTER COLUMN "startTime" DROP NOT NULL,
ADD CONSTRAINT "Deliveries_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ops"."Measurements" DROP CONSTRAINT "Measurements_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "deliveryId",
ADD COLUMN     "deliveryId" UUID NOT NULL,
ADD CONSTRAINT "Measurements_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ops"."Schedule" DROP CONSTRAINT "Schedule_pkey",
DROP COLUMN "dropIn",
ADD COLUMN     "cancelReason" TEXT,
ADD COLUMN     "cancelled" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "orderId",
ADD COLUMN     "orderId" UUID NOT NULL,
ADD CONSTRAINT "Schedule_pkey" PRIMARY KEY ("orderId");

-- AlterTable
ALTER TABLE "timeseries"."Orders" DROP CONSTRAINT "Orders_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "Orders_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "ops"."Schedule" ADD CONSTRAINT "Schedule_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "timeseries"."Orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."Callouts" ADD CONSTRAINT "Callouts_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "ops"."Schedule"("orderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."Deliveries" ADD CONSTRAINT "Deliveries_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "ops"."Schedule"("orderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."Measurements" ADD CONSTRAINT "Measurements_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "ops"."Deliveries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis"."OrderAnalysis" ADD CONSTRAINT "OrderAnalysis_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "ops"."Schedule"("orderId") ON DELETE RESTRICT ON UPDATE CASCADE;
