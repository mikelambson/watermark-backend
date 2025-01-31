/*
  Warnings:

  - You are about to drop the column `orderTimestamp` on the `Orders` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ordertimestamp,orderNumber]` on the table `Orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ordertimestamp` to the `Orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "timeseries"."Orders_orderTimestamp_orderNumber_key";

-- DropIndex
DROP INDEX "timeseries"."order_number_timestamp_index";

-- DropIndex
DROP INDEX "timeseries"."order_status_timestamp_index";

-- DropIndex
DROP INDEX "timeseries"."order_timestamp_index";

-- AlterTable
ALTER TABLE "timeseries"."Orders" DROP COLUMN "orderTimestamp",
ADD COLUMN     "ordertimestamp" TIMESTAMPTZ(3) NOT NULL;

-- CreateIndex
CREATE INDEX "order_timestamp_index" ON "timeseries"."Orders" USING BRIN ("ordertimestamp");

-- CreateIndex
CREATE INDEX "order_number_timestamp_index" ON "timeseries"."Orders" USING BRIN ("orderNumber", "ordertimestamp");

-- CreateIndex
CREATE INDEX "order_status_timestamp_index" ON "timeseries"."Orders" USING BRIN ("status", "ordertimestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Orders_ordertimestamp_orderNumber_key" ON "timeseries"."Orders"("ordertimestamp", "orderNumber");
