/*
  Warnings:

  - The primary key for the `Schedule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `orderId` on the `Callouts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `orderId` on the `Deliveries` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `orderId` on the `Schedule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "ops"."Callouts" DROP CONSTRAINT "Callouts_orderId_fkey";

-- DropForeignKey
ALTER TABLE "ops"."Deliveries" DROP CONSTRAINT "Deliveries_orderId_fkey";

-- DropForeignKey
ALTER TABLE "ops"."Schedule" DROP CONSTRAINT "Schedule_orderId_fkey";

-- AlterTable
ALTER TABLE "ops"."Callouts" DROP COLUMN "orderId",
ADD COLUMN     "orderId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ops"."Deliveries" DROP COLUMN "orderId",
ADD COLUMN     "orderId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ops"."Schedule" DROP CONSTRAINT "Schedule_pkey",
DROP COLUMN "orderId",
ADD COLUMN     "orderId" INTEGER NOT NULL,
ADD CONSTRAINT "Schedule_pkey" PRIMARY KEY ("orderId", "scheduledLineId");

-- AlterTable
ALTER TABLE "timeseries"."Orders" DROP CONSTRAINT "Orders_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Orders_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "ops"."Schedule" ADD CONSTRAINT "Schedule_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "timeseries"."Orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."Callouts" ADD CONSTRAINT "Callouts_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "timeseries"."Orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."Deliveries" ADD CONSTRAINT "Deliveries_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "timeseries"."Orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
