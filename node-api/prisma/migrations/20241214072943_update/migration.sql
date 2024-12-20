/*
  Warnings:

  - You are about to drop the column `affiliation` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `contactInformation` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `contactNumber` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.
  - Added the required column `licenseNumber` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yearsOfExperience` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `password` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Specialization" AS ENUM ('CARDIOLOGIST', 'NEUROLOGIST', 'PEDIATRICIAN', 'SURGEON');

-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "affiliation",
DROP COLUMN "contactInformation",
ADD COLUMN     "avalibility" JSONB,
ADD COLUMN     "licenseNumber" TEXT NOT NULL,
ADD COLUMN     "yearsOfExperience" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "address",
DROP COLUMN "contactNumber",
DROP COLUMN "gender",
ALTER COLUMN "dateOfBirth" DROP NOT NULL,
ALTER COLUMN "emergencyContact" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "contactNumber" TEXT,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "gender" TEXT,
ALTER COLUMN "password" SET NOT NULL;
