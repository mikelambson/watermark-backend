-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "analysis";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "config";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "maint";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "master";

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
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requiresLDAP" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "protected" BOOLEAN NOT NULL DEFAULT false,
    "superAdmin" BOOLEAN NOT NULL DEFAULT false,

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
CREATE TABLE "auth"."TwoFactorAuth" (
    "id" TEXT NOT NULL,
    "userid" UUID NOT NULL,
    "method" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "backupCodes" TEXT[],
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "TwoFactorAuth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."LdapAuth" (
    "id" TEXT NOT NULL,
    "userid" UUID NOT NULL,
    "ldapUrl" TEXT NOT NULL,
    "baseDn" TEXT NOT NULL,
    "bindDn" TEXT NOT NULL,
    "ldapUsername" TEXT NOT NULL,
    "ldapPassword" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "LdapAuth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."ActiveSessions" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ActiveSessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeseries"."Orders" (
    "orderTimestamp" TIMESTAMPTZ(3) NOT NULL,
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
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeseries"."logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "time" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changes" JSONB NOT NULL,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeseries"."PasswordResets" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "resetToken" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "usedAt" TIMESTAMPTZ(3),

    CONSTRAINT "PasswordResets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeseries"."AuthAuditLogs" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthAuditLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ops"."Schedule" (
    "scheduledDate" TIMESTAMPTZ(3),
    "scheduledHead" INTEGER,
    "travelTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "instructions" TEXT,
    "watermasterNote" JSONB,
    "specialRequest" TEXT,
    "scheduledLineId" INTEGER NOT NULL DEFAULT 0,
    "cancelReason" TEXT,
    "cancelled" BOOLEAN NOT NULL DEFAULT false,
    "orderId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "ops"."Callouts" (
    "id" SERIAL NOT NULL,
    "callout" BOOLEAN DEFAULT false,
    "calloutDone" TIMESTAMPTZ(3),
    "calloutUser" UUID NOT NULL,
    "scheduleId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Callouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ops"."Deliveries" (
    "startTime" TIMESTAMP(3),
    "stopTime" TIMESTAMP(3),
    "deliveryNote" TEXT,
    "orderId" INTEGER NOT NULL,
    "scheduleId" UUID NOT NULL,
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ops"."Measurements" (
    "startTime" TIMESTAMP(3) NOT NULL,
    "stopTime" TIMESTAMP(3),
    "measurement" INTEGER NOT NULL,
    "measurementType" TEXT NOT NULL DEFAULT 'estimation',
    "measurementNote" TEXT,
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "deliveryId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Measurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ops"."OperationalFlows" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "remoteSource" TEXT,
    "remoteValue" DOUBLE PRECISION,
    "remoteTimestamp" TIMESTAMP(3),
    "override" BOOLEAN NOT NULL DEFAULT false,
    "manualValue" DOUBLE PRECISION,
    "manualTimestamp" TIMESTAMP(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "OperationalFlows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ops"."HeadSheets" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "maxHeads" INTEGER NOT NULL,
    "structureRef" TEXT,
    "maxFlow" INTEGER,
    "characteristics" JSONB,
    "district" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "HeadSheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis"."OrderAnalysis" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "startTime" TIMESTAMP(3) NOT NULL,
    "stopTime" TIMESTAMP(3) NOT NULL,
    "cfs" DOUBLE PRECISION NOT NULL,
    "af" DOUBLE PRECISION NOT NULL,
    "analysisNote" TEXT NOT NULL,
    "scheduleId" UUID NOT NULL,

    CONSTRAINT "OrderAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_login_key" ON "auth"."Users"("login");

-- CreateIndex
CREATE UNIQUE INDEX "Roles_name_key" ON "auth"."Roles"("name");

-- CreateIndex
CREATE INDEX "TwoFactorAuth_userid_createdAt_idx" ON "auth"."TwoFactorAuth"("userid", "createdAt");

-- CreateIndex
CREATE INDEX "LdapAuth_userid_ldapUsername_idx" ON "auth"."LdapAuth"("userid", "ldapUsername");

-- CreateIndex
CREATE INDEX "ActiveSessions_userId_createdAt_idx" ON "auth"."ActiveSessions"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "order_timestamp_index" ON "timeseries"."Orders" USING BRIN ("orderTimestamp");

-- CreateIndex
CREATE INDEX "status_index" ON "timeseries"."Orders" USING HASH ("status");

-- CreateIndex
CREATE INDEX "order_number_index" ON "timeseries"."Orders" USING HASH ("orderNumber");

-- CreateIndex
CREATE INDEX "tcid_sn_index" ON "timeseries"."Orders" USING HASH ("tcidSn");

-- CreateIndex
CREATE INDEX "order_number_timestamp_index" ON "timeseries"."Orders" USING BRIN ("orderNumber", "orderTimestamp");

-- CreateIndex
CREATE INDEX "order_status_timestamp_index" ON "timeseries"."Orders" USING BRIN ("status", "orderTimestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Orders_orderTimestamp_orderNumber_key" ON "timeseries"."Orders"("orderTimestamp", "orderNumber");

-- CreateIndex
CREATE INDEX "logs_time_idx" ON "timeseries"."logs"("time");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResets_resetToken_key" ON "timeseries"."PasswordResets"("resetToken");

-- CreateIndex
CREATE INDEX "PasswordResets_userId_createdAt_idx" ON "timeseries"."PasswordResets"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuthAuditLogs_userId_createdAt_idx" ON "timeseries"."AuthAuditLogs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "schedule_date_index" ON "ops"."Schedule" USING BRIN ("scheduledDate");

-- AddForeignKey
ALTER TABLE "auth"."UserRoles" ADD CONSTRAINT "UserRoles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "auth"."Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."UserRoles" ADD CONSTRAINT "UserRoles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."TwoFactorAuth" ADD CONSTRAINT "TwoFactorAuth_userid_fkey" FOREIGN KEY ("userid") REFERENCES "auth"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."LdapAuth" ADD CONSTRAINT "LdapAuth_userid_fkey" FOREIGN KEY ("userid") REFERENCES "auth"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."ActiveSessions" ADD CONSTRAINT "ActiveSessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeseries"."PasswordResets" ADD CONSTRAINT "PasswordResets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeseries"."AuthAuditLogs" ADD CONSTRAINT "AuthAuditLogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."Schedule" ADD CONSTRAINT "Schedule_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "timeseries"."Orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."Schedule" ADD CONSTRAINT "Schedule_scheduledLineId_fkey" FOREIGN KEY ("scheduledLineId") REFERENCES "ops"."HeadSheets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."Callouts" ADD CONSTRAINT "Callouts_calloutUser_fkey" FOREIGN KEY ("calloutUser") REFERENCES "auth"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."Callouts" ADD CONSTRAINT "Callouts_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "ops"."Schedule"("orderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."Deliveries" ADD CONSTRAINT "Deliveries_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "ops"."Schedule"("orderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."Measurements" ADD CONSTRAINT "Measurements_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "ops"."Deliveries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis"."OrderAnalysis" ADD CONSTRAINT "OrderAnalysis_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "ops"."Schedule"("orderId") ON DELETE RESTRICT ON UPDATE CASCADE;
