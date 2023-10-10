/*
  Warnings:

  - You are about to alter the column `phoneNumber` on the `LegacyOrders` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `phoneNumber2` on the `LegacyOrders` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `phoneNumber3` on the `LegacyOrders` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `orderNumber` on the `LegacyOrders` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "legacy"."LegacyOrders" ALTER COLUMN "phoneNumber" SET DATA TYPE INTEGER,
ALTER COLUMN "phoneNumber2" SET DATA TYPE INTEGER,
ALTER COLUMN "phoneNumber3" SET DATA TYPE INTEGER,
ALTER COLUMN "orderNumber" SET DATA TYPE INTEGER;
