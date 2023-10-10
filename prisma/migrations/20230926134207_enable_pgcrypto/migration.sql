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

-- CreateIndex
CREATE UNIQUE INDEX "Users_login_key" ON "auth"."Users"("login");

-- CreateIndex
CREATE UNIQUE INDEX "Roles_name_key" ON "auth"."Roles"("name");

-- AddForeignKey
ALTER TABLE "auth"."UserRoles" ADD CONSTRAINT "UserRoles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."UserRoles" ADD CONSTRAINT "UserRoles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "auth"."Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
