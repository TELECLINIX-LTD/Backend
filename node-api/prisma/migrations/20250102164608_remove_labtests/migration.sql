/*
  Warnings:

  - You are about to drop the column `insuranceInformation` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the `LabTest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LabTest" DROP CONSTRAINT "LabTest_patientId_fkey";

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "insuranceInformation";

-- DropTable
DROP TABLE "LabTest";
