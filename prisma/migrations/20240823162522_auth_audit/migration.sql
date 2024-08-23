/*
  Warnings:

  - Added the required column `updatedAt` to the `Roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Callouts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Deliveries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `HeadSheets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Measurements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `OperationalFlows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "auth"."Roles" ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "requiresLDAP" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL;

-- AlterTable
ALTER TABLE "ops"."Callouts" ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL;

-- AlterTable
ALTER TABLE "ops"."Deliveries" ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL;

-- AlterTable
ALTER TABLE "ops"."HeadSheets" ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL;

-- AlterTable
ALTER TABLE "ops"."Measurements" ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL;

-- AlterTable
ALTER TABLE "ops"."OperationalFlows" ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "ops"."Schedule" ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL;

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
CREATE TABLE "timeseries"."logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "time" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changes" JSONB NOT NULL,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TwoFactorAuth_userid_createdAt_idx" ON "auth"."TwoFactorAuth"("userid", "createdAt");

-- CreateIndex
CREATE INDEX "LdapAuth_userid_ldapUsername_idx" ON "auth"."LdapAuth"("userid", "ldapUsername");

-- CreateIndex
CREATE INDEX "logs_time_idx" ON "timeseries"."logs"("time");

-- AddForeignKey
ALTER TABLE "auth"."TwoFactorAuth" ADD CONSTRAINT "TwoFactorAuth_userid_fkey" FOREIGN KEY ("userid") REFERENCES "auth"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."LdapAuth" ADD CONSTRAINT "LdapAuth_userid_fkey" FOREIGN KEY ("userid") REFERENCES "auth"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
