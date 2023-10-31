/*
  Warnings:

  - The primary key for the `Schedule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Orders` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderTimestamp,orderNumber]` on the table `Orders` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `orderId` on the `Callouts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `orderId` on the `Deliveries` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `orderId` on the `Schedule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "ops"."Callouts" DROP CONSTRAINT "Callouts_orderId_fkey";

-- DropForeignKey
ALTER TABLE "ops"."Deliveries" DROP CONSTRAINT "Deliveries_orderId_fkey";

-- DropForeignKey
ALTER TABLE "ops"."Schedule" DROP CONSTRAINT "Schedule_orderId_fkey";

-- AlterTable
ALTER TABLE "ops"."Callouts" DROP COLUMN "orderId",
ADD COLUMN     "orderId" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ops"."Deliveries" DROP COLUMN "orderId",
ADD COLUMN     "orderId" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ops"."Schedule" DROP CONSTRAINT "Schedule_pkey",
DROP COLUMN "orderId",
ADD COLUMN     "orderId" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "Schedule_pkey" PRIMARY KEY ("orderId", "scheduledLineId");

-- AlterTable
ALTER TABLE "timeseries"."Orders" DROP CONSTRAINT "Orders_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Orders_pkey" PRIMARY KEY ("orderTimestamp");

-- CreateIndex
CREATE INDEX "order_number_timestamp_index" ON "timeseries"."Orders" USING BRIN ("orderNumber", "orderTimestamp");

-- CreateIndex
CREATE INDEX "order_status_timestamp_index" ON "timeseries"."Orders" USING BRIN ("status", "orderTimestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Orders_orderTimestamp_orderNumber_key" ON "timeseries"."Orders"("orderTimestamp", "orderNumber");

-- AddForeignKey
ALTER TABLE "ops"."Schedule" ADD CONSTRAINT "Schedule_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "timeseries"."Orders"("orderTimestamp") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."Callouts" ADD CONSTRAINT "Callouts_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "timeseries"."Orders"("orderTimestamp") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."Deliveries" ADD CONSTRAINT "Deliveries_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "timeseries"."Orders"("orderTimestamp") ON DELETE RESTRICT ON UPDATE CASCADE;
