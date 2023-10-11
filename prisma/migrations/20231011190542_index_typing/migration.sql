-- DropIndex
DROP INDEX "legacy"."order_id_index";

-- DropIndex
DROP INDEX "legacy"."status_index";

-- DropIndex
DROP INDEX "ops"."Schedule_scheduledDate_idx";

-- CreateIndex
CREATE INDEX "order_id_index" ON "legacy"."LegacyOrders" USING BRIN ("id");

-- CreateIndex
CREATE INDEX "status_index" ON "legacy"."LegacyOrders" USING HASH ("status");

-- CreateIndex
CREATE INDEX "schedule_date_index" ON "ops"."Schedule" USING BRIN ("scheduledDate");
