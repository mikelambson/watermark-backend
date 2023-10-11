/*
  Warnings:

  - You are about to drop the column `scheduledAt` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the `headSheet` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `scheduledDate` to the `Orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ops"."Orders" DROP CONSTRAINT "Orders_orderId_fkey";

-- AlterTable
ALTER TABLE "ops"."Orders" DROP COLUMN "scheduledAt",
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "scheduledDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "watermasterNote" TEXT;

-- DropTable
DROP TABLE "ops"."headSheet";

-- CreateTable
CREATE TABLE "ops"."HeadSheets" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "maxHeads" INTEGER NOT NULL,
    "maxFlow" INTEGER,
    "characteristics" JSONB,

    CONSTRAINT "HeadSheets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Orders_scheduledDate_idx" ON "ops"."Orders"("scheduledDate");

-- AddForeignKey
ALTER TABLE "ops"."Orders" ADD CONSTRAINT "Orders_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "legacy"."LegacyOrders"("orderNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
