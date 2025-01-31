/*
  Warnings:

  - You are about to drop the column `fullname` on the `Users` table. All the data in the column will be lost.
  - You are about to alter the column `login` on the `Users` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(255)`.
  - You are about to alter the column `password` on the `Users` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(512)`.
  - You are about to alter the column `email` on the `Users` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(254)`.
  - You are about to alter the column `title` on the `Users` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(100)`.
  - You are about to drop the column `orderTimestamp` on the `Orders` table. All the data in the column will be lost.
  - The primary key for the `logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[ordertimestamp,orderNumber]` on the table `Orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `firstName` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ordertimestamp` to the `Orders` table without a default value. This is not possible if the table is not empty.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "timescaledb";

-- DropForeignKey
ALTER TABLE "ops"."Schedule" DROP CONSTRAINT "Schedule_orderId_fkey";

-- DropIndex
DROP INDEX "timeseries"."Orders_orderTimestamp_orderNumber_key";

-- DropIndex
DROP INDEX "timeseries"."order_number_timestamp_index";

-- DropIndex
DROP INDEX "timeseries"."order_status_timestamp_index";

-- DropIndex
DROP INDEX "timeseries"."order_timestamp_index";

-- DropIndex
DROP INDEX "timeseries"."logs_time_idx";

-- AlterTable
ALTER TABLE "auth"."Users" DROP COLUMN "fullname",
ADD COLUMN     "firstName" VARCHAR(100) NOT NULL,
ADD COLUMN     "lastName" VARCHAR(100) NOT NULL,
ADD COLUMN     "middleName" VARCHAR(100),
ADD COLUMN     "temppass" VARCHAR(255),
ALTER COLUMN "login" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(512),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(254),
ALTER COLUMN "title" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "timeseries"."Orders" DROP COLUMN "orderTimestamp",
ADD COLUMN     "ordertimestamp" TIMESTAMPTZ(3) NOT NULL;

-- AlterTable
ALTER TABLE "timeseries"."logs" DROP CONSTRAINT "logs_pkey",
ADD CONSTRAINT "logs_pkey" PRIMARY KEY ("time", "id");

-- CreateTable
CREATE TABLE "auth"."UserMeta" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "preferences" JSONB,
    "authorizedSerials" JSONB,
    "adminNotes" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "UserMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."Permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."RolePermissions" (
    "roleId" UUID NOT NULL,
    "permissionId" UUID NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RolePermissions_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateIndex
CREATE INDEX "UserMeta_userId_idx" ON "auth"."UserMeta"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Permissions_name_key" ON "auth"."Permissions"("name");

-- CreateIndex
CREATE INDEX "order_timestamp_index" ON "timeseries"."Orders" USING BRIN ("ordertimestamp");

-- CreateIndex
CREATE INDEX "order_number_timestamp_index" ON "timeseries"."Orders" USING BRIN ("orderNumber", "ordertimestamp");

-- CreateIndex
CREATE INDEX "order_status_timestamp_index" ON "timeseries"."Orders" USING BRIN ("status", "ordertimestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Orders_ordertimestamp_orderNumber_key" ON "timeseries"."Orders"("ordertimestamp", "orderNumber");

-- AddForeignKey
ALTER TABLE "auth"."UserMeta" ADD CONSTRAINT "UserMeta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."RolePermissions" ADD CONSTRAINT "RolePermissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "auth"."Roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."RolePermissions" ADD CONSTRAINT "RolePermissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "auth"."Permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."Schedule" ADD CONSTRAINT "Schedule_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "timeseries"."Orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
