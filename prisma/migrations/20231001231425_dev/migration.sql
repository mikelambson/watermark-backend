-- CreateIndex
CREATE INDEX "adjust_index" ON "legacy"."LegacyOrders"("adjust");

-- CreateIndex
CREATE INDEX "order_timestamp_index" ON "legacy"."LegacyOrders"("orderTimestamp");

-- CreateIndex
CREATE INDEX "order_number_index" ON "legacy"."LegacyOrders"("orderNumber");

-- CreateIndex
CREATE INDEX "tcid_sn_index" ON "legacy"."LegacyOrders"("tcidSn");
