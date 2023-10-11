/*
  Warnings:

  - You are about to drop the `Orders` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ops"."Orders" DROP CONSTRAINT "Orders_orderId_fkey";

-- DropTable
DROP TABLE "ops"."Orders";

-- CreateTable
CREATE TABLE "ops"."Schedule" (
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "orderId" INTEGER NOT NULL,
    "scheduledLine" TEXT,
    "scheduledHead" INTEGER,
    "dropIn" BOOLEAN DEFAULT false,
    "instructions" TEXT,
    "watermasterNote" TEXT,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("orderId")
);

-- CreateIndex
CREATE INDEX "Schedule_scheduledDate_idx" ON "ops"."Schedule"("scheduledDate");

-- AddForeignKey
ALTER TABLE "ops"."Schedule" ADD CONSTRAINT "Schedule_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "legacy"."LegacyOrders"("orderNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
