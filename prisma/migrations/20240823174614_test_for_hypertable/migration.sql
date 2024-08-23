/*
  Warnings:

  - The primary key for the `logs` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "timeseries"."logs" DROP CONSTRAINT "logs_pkey",
ADD CONSTRAINT "logs_pkey" PRIMARY KEY ("time", "id");
