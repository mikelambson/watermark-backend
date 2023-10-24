/*
  Warnings:

  - The primary key for the `Schedule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `scheduledLine` on the `Schedule` table. All the data in the column will be lost.
  - Added the required column `scheduledLineId` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ops"."Schedule" DROP CONSTRAINT "Schedule_pkey",
DROP COLUMN "scheduledLine",
ADD COLUMN     "scheduledLineId" INTEGER NOT NULL,
ADD CONSTRAINT "Schedule_pkey" PRIMARY KEY ("orderId", "scheduledLineId");

-- AddForeignKey
ALTER TABLE "ops"."Schedule" ADD CONSTRAINT "Schedule_scheduledLineId_fkey" FOREIGN KEY ("scheduledLineId") REFERENCES "ops"."HeadSheets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
