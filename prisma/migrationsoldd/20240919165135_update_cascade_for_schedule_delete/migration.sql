-- DropForeignKey
ALTER TABLE "ops"."Schedule" DROP CONSTRAINT "Schedule_orderId_fkey";

-- AddForeignKey
ALTER TABLE "ops"."Schedule" ADD CONSTRAINT "Schedule_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "timeseries"."Orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
