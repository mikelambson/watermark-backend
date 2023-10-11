/*
  Warnings:

  - A unique constraint covering the columns `[orderNumber]` on the table `LegacyOrders` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LegacyOrders_orderNumber_key" ON "legacy"."LegacyOrders"("orderNumber");
