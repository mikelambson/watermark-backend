-- AlterTable
ALTER TABLE "ops"."Schedule" ALTER COLUMN "scheduledDate" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "timeseries"."Orders" ALTER COLUMN "orderTimestamp" SET DATA TYPE TIMESTAMPTZ(3);
