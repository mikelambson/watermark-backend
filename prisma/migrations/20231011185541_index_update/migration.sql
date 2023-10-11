-- DropIndex
DROP INDEX "legacy"."order_timestamp_index";

-- DropIndex
DROP INDEX "legacy"."status_index";

-- CreateIndex
CREATE INDEX "status_index" ON "legacy"."LegacyOrders" USING BRIN ("status");

-- CreateIndex
CREATE INDEX "order_timestamp_index" ON "legacy"."LegacyOrders" USING BRIN ("orderTimestamp");
