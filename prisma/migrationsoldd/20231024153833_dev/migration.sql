/*
  Warnings:

  - Made the column `scheduledLine` on table `Schedule` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dropIn` on table `Schedule` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "timeseries"."Orders_id_key";

-- AlterTable
ALTER TABLE "ops"."Schedule" ALTER COLUMN "scheduledLine" SET NOT NULL,
ALTER COLUMN "dropIn" SET NOT NULL;
