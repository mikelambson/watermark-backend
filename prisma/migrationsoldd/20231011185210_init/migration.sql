-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "analysis";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "config";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "legacy";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "maint";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "ops";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "timeseries";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateTable
CREATE TABLE "auth"."Users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "login" VARCHAR NOT NULL,
    "password" VARCHAR NOT NULL,
    "fullname" VARCHAR,
    "email" VARCHAR,
    "title" VARCHAR DEFAULT 'user',
    "tcid_staff" BOOLEAN DEFAULT false,
    "protected" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."Roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."UserRoles" (
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "UserRoles_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "legacy"."LegacyOrders" (
    "id" SERIAL NOT NULL,
    "orderTimestamp" TIMESTAMP(3),
    "orderNumber" INTEGER NOT NULL,
    "tcidSn" TEXT,
    "district" TEXT,
    "status" TEXT,
    "laterals" TEXT[],
    "approxCfs" DOUBLE PRECISION,
    "approxHrs" DOUBLE PRECISION,
    "phoneNumbers" TEXT[],
    "remarks" TEXT,
    "details" JSONB,
    "scheduled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LegacyOrders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ops"."Schedule" (
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "orderId" INTEGER NOT NULL,
    "scheduledLine" TEXT,
    "scheduledHead" INTEGER,
    "travelTime" INTEGER NOT NULL DEFAULT 0,
    "dropIn" BOOLEAN DEFAULT false,
    "instructions" TEXT,
    "watermasterNote" JSONB,
    "specialRequest" TEXT,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "ops"."Callouts" (
    "id" SERIAL NOT NULL,
    "callout" BOOLEAN DEFAULT false,
    "calloutDone" TIMESTAMP(3),
    "calloutUser" UUID NOT NULL,
    "orderId" INTEGER NOT NULL,

    CONSTRAINT "Callouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ops"."HeadSheets" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "maxHeads" INTEGER NOT NULL,
    "structureRef" TEXT,
    "maxFlow" INTEGER,
    "characteristics" JSONB,

    CONSTRAINT "HeadSheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ops"."Deliveries" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "stopTime" TIMESTAMP(3),
    "deliveryNote" TEXT,

    CONSTRAINT "Deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ops"."Measurements" (
    "id" SERIAL NOT NULL,
    "deliveryId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "stopTime" TIMESTAMP(3),
    "measurement" INTEGER NOT NULL,
    "measurementType" TEXT NOT NULL DEFAULT 'estimation',
    "measurementNote" TEXT,

    CONSTRAINT "Measurements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_login_key" ON "auth"."Users"("login");

-- CreateIndex
CREATE UNIQUE INDEX "Roles_name_key" ON "auth"."Roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "LegacyOrders_orderNumber_key" ON "legacy"."LegacyOrders"("orderNumber");

-- CreateIndex
CREATE INDEX "order_id_index" ON "legacy"."LegacyOrders"("id");

-- CreateIndex
CREATE INDEX "status_index" ON "legacy"."LegacyOrders" USING HASH ("status");

-- CreateIndex
CREATE INDEX "order_timestamp_index" ON "legacy"."LegacyOrders"("orderTimestamp");

-- CreateIndex
CREATE INDEX "order_number_index" ON "legacy"."LegacyOrders" USING HASH ("orderNumber");

-- CreateIndex
CREATE INDEX "tcid_sn_index" ON "legacy"."LegacyOrders" USING HASH ("tcidSn");

-- CreateIndex
CREATE INDEX "Schedule_scheduledDate_idx" ON "ops"."Schedule"("scheduledDate");

-- AddForeignKey
ALTER TABLE "auth"."UserRoles" ADD CONSTRAINT "UserRoles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."UserRoles" ADD CONSTRAINT "UserRoles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "auth"."Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."Schedule" ADD CONSTRAINT "Schedule_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "legacy"."LegacyOrders"("orderNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."Callouts" ADD CONSTRAINT "Callouts_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "legacy"."LegacyOrders"("orderNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."Callouts" ADD CONSTRAINT "Callouts_calloutUser_fkey" FOREIGN KEY ("calloutUser") REFERENCES "auth"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."Deliveries" ADD CONSTRAINT "Deliveries_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "legacy"."LegacyOrders"("orderNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."Measurements" ADD CONSTRAINT "Measurements_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "ops"."Deliveries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
