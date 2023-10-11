/*
  Warnings:

  - You are about to drop the column `adjust` on the `LegacyOrders` table. All the data in the column will be lost.
  - You are about to drop the column `approxAf` on the `LegacyOrders` table. All the data in the column will be lost.
  - You are about to drop the column `balance` on the `LegacyOrders` table. All the data in the column will be lost.
  - You are about to drop the column `irrigatorsName` on the `LegacyOrders` table. All the data in the column will be lost.
  - You are about to drop the column `lateral1` on the `LegacyOrders` table. All the data in the column will be lost.
  - You are about to drop the column `lateral2` on the `LegacyOrders` table. All the data in the column will be lost.
  - You are about to drop the column `lateral3` on the `LegacyOrders` table. All the data in the column will be lost.
  - You are about to drop the column `lateral4` on the `LegacyOrders` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `LegacyOrders` table. All the data in the column will be lost.
  - You are about to drop the column `ownersName` on the `LegacyOrders` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `LegacyOrders` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber2` on the `LegacyOrders` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber3` on the `LegacyOrders` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "legacy"."adjust_index";

-- AlterTable
ALTER TABLE "legacy"."LegacyOrders" DROP COLUMN "adjust",
DROP COLUMN "approxAf",
DROP COLUMN "balance",
DROP COLUMN "irrigatorsName",
DROP COLUMN "lateral1",
DROP COLUMN "lateral2",
DROP COLUMN "lateral3",
DROP COLUMN "lateral4",
DROP COLUMN "name",
DROP COLUMN "ownersName",
DROP COLUMN "phoneNumber",
DROP COLUMN "phoneNumber2",
DROP COLUMN "phoneNumber3",
ADD COLUMN     "details" JSONB,
ADD COLUMN     "laterals" TEXT[],
ADD COLUMN     "phoneNumbers" TEXT[],
ADD COLUMN     "status" TEXT,
ALTER COLUMN "tcidSn" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ops"."Orders" (
    "orderId" INTEGER NOT NULL,
    "scheduledLine" TEXT,
    "scheduledHead" INTEGER,
    "scheduledAt" TIMESTAMP(3),
    "dropIn" BOOLEAN DEFAULT false,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "ops"."headSheet" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "maxHeads" INTEGER NOT NULL,
    "maxFlow" INTEGER,
    "characteristics" JSONB,

    CONSTRAINT "headSheet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "status_index" ON "legacy"."LegacyOrders"("status");

-- AddForeignKey
ALTER TABLE "ops"."Orders" ADD CONSTRAINT "Orders_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "legacy"."LegacyOrders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
