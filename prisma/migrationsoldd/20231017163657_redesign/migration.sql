/*
  Warnings:

  - You are about to drop the `LegacyOrders` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "master";

-- DropForeignKey
ALTER TABLE "ops"."Callouts" DROP CONSTRAINT "Callouts_orderId_fkey";

-- DropForeignKey
ALTER TABLE "ops"."Deliveries" DROP CONSTRAINT "Deliveries_orderId_fkey";

-- DropForeignKey
ALTER TABLE "ops"."Schedule" DROP CONSTRAINT "Schedule_orderId_fkey";

-- DropTable
DROP TABLE "legacy"."LegacyOrders";

-- CreateTable
CREATE TABLE "timeseries"."Orders" (
    "orderTimestamp" TIMESTAMP(3) NOT NULL,
    "orderNumber" INTEGER NOT NULL,
    "tcidSn" TEXT,
    "district" TEXT,
    "status" TEXT,
    "laterals" TEXT[],
    "approxCfs" DOUBLE PRECISION,
    "approxHrs" DOUBLE PRECISION,
    "phoneNumbers" TEXT[],
    "remarks" TEXT,
    "details" JSONB,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("orderTimestamp","orderNumber")
);

-- CreateIndex
CREATE UNIQUE INDEX "Orders_orderNumber_key" ON "timeseries"."Orders"("orderNumber");

-- CreateIndex
CREATE INDEX "status_index" ON "timeseries"."Orders" USING HASH ("status");

-- CreateIndex
CREATE INDEX "order_timestamp_index" ON "timeseries"."Orders" USING BRIN ("orderTimestamp");

-- CreateIndex
CREATE INDEX "order_number_index" ON "timeseries"."Orders" USING HASH ("orderNumber");

-- CreateIndex
CREATE INDEX "tcid_sn_index" ON "timeseries"."Orders" USING HASH ("tcidSn");

-- AddForeignKey
ALTER TABLE "ops"."Schedule" ADD CONSTRAINT "Schedule_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "timeseries"."Orders"("orderNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."Callouts" ADD CONSTRAINT "Callouts_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "timeseries"."Orders"("orderNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."Deliveries" ADD CONSTRAINT "Deliveries_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "timeseries"."Orders"("orderNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
