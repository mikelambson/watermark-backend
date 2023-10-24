/*
  Warnings:

  - The primary key for the `Orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `Orders` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ops"."Callouts" DROP CONSTRAINT "Callouts_orderId_fkey";

-- DropForeignKey
ALTER TABLE "ops"."Deliveries" DROP CONSTRAINT "Deliveries_orderId_fkey";

-- DropForeignKey
ALTER TABLE "ops"."Schedule" DROP CONSTRAINT "Schedule_orderId_fkey";

-- DropIndex
DROP INDEX "timeseries"."Orders_orderNumber_key";

-- AlterTable
ALTER TABLE "timeseries"."Orders" DROP CONSTRAINT "Orders_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Orders_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Orders_id_key" ON "timeseries"."Orders"("id");

-- AddForeignKey
ALTER TABLE "ops"."Schedule" ADD CONSTRAINT "Schedule_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "timeseries"."Orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."Callouts" ADD CONSTRAINT "Callouts_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "timeseries"."Orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."Deliveries" ADD CONSTRAINT "Deliveries_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "timeseries"."Orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
