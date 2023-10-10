/*
  Warnings:

  - The `phoneNumber` column on the `LegacyOrders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `phoneNumber2` column on the `LegacyOrders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `phoneNumber3` column on the `LegacyOrders` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "legacy"."LegacyOrders" DROP COLUMN "phoneNumber",
ADD COLUMN     "phoneNumber" INTEGER,
DROP COLUMN "phoneNumber2",
ADD COLUMN     "phoneNumber2" INTEGER,
DROP COLUMN "phoneNumber3",
ADD COLUMN     "phoneNumber3" INTEGER;
