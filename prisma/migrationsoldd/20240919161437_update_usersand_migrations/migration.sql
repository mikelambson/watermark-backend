/*
  Warnings:

  - You are about to drop the column `fullname` on the `Users` table. All the data in the column will be lost.
  - You are about to alter the column `login` on the `Users` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(255)`.
  - You are about to alter the column `password` on the `Users` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(512)`.
  - You are about to alter the column `email` on the `Users` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(254)`.
  - You are about to alter the column `title` on the `Users` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(100)`.
  - Added the required column `firstName` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
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
