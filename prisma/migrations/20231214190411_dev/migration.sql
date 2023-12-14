/*
  Warnings:

  - You are about to drop the column `level` on the `OperationalFlows` table. All the data in the column will be lost.
  - You are about to drop the column `levelType` on the `OperationalFlows` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ops"."OperationalFlows" DROP COLUMN "level",
DROP COLUMN "levelType";
