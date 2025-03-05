/*
  Warnings:

  - Added the required column `district` to the `HeadSheets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ops"."HeadSheets" ADD COLUMN     "district" TEXT NOT NULL;
