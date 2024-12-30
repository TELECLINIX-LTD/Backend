/*
  Warnings:

  - You are about to drop the column `avalibility` on the `Doctor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "avalibility",
ADD COLUMN     "availability" TEXT[];
