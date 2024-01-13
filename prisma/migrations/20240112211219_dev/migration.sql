-- CreateTable
CREATE TABLE "analysis"."OrderAnalysis" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "stopTime" TIMESTAMP(3) NOT NULL,
    "cfs" DOUBLE PRECISION NOT NULL,
    "af" DOUBLE PRECISION NOT NULL,
    "analysisNote" TEXT NOT NULL,

    CONSTRAINT "OrderAnalysis_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "analysis"."OrderAnalysis" ADD CONSTRAINT "OrderAnalysis_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "timeseries"."Orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
