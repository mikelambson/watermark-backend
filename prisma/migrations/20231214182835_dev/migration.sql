-- CreateTable
CREATE TABLE "ops"."OperationalFlows" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "remoteSource" TEXT,
    "remoteValue" INTEGER,
    "remoteTimestamp" TIMESTAMP(3),
    "override" BOOLEAN NOT NULL DEFAULT false,
    "manualValue" INTEGER,
    "manualTimestamp" TIMESTAMP(3),

    CONSTRAINT "OperationalFlows_pkey" PRIMARY KEY ("id")
);
