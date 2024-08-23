-- AlterTable
ALTER TABLE "auth"."Roles" ADD COLUMN     "protected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "superAdmin" BOOLEAN NOT NULL DEFAULT false;
