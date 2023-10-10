-- CreateTable
CREATE TABLE "legacy"."LegacyOrders" (
    "id" SERIAL NOT NULL,
    "orderTimestamp" TIMESTAMP(3) NOT NULL,
    "irrigatorsName" TEXT,
    "ownersName" TEXT,
    "name" TEXT,
    "phoneNumber" INTEGER,
    "phoneNumber2" INTEGER,
    "phoneNumber3" INTEGER,
    "lateral1" TEXT NOT NULL,
    "lateral2" TEXT,
    "lateral3" TEXT,
    "lateral4" TEXT,
    "approxCfs" DOUBLE PRECISION,
    "approxHrs" DOUBLE PRECISION,
    "orderNumber" INTEGER NOT NULL,
    "tcidSn" TEXT NOT NULL,
    "remarks" TEXT,
    "approxAf" DOUBLE PRECISION,
    "balance" DOUBLE PRECISION,
    "district" TEXT,
    "adjust" TEXT NOT NULL,

    CONSTRAINT "LegacyOrders_pkey" PRIMARY KEY ("id")
);
