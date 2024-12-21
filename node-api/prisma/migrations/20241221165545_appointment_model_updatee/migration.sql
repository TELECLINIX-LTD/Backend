/*
  Warnings:

  - You are about to drop the column `appointmentDate` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `appointmentTime` on the `Appointment` table. All the data in the column will be lost.
  - Added the required column `date` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Appointment"
DROP COLUMN "appointmentDate",
DROP COLUMN "appointmentTime",
ADD COLUMN     "ailment" TEXT,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "lastMedication" TEXT,
ADD COLUMN     "reason" TEXT,
ADD COLUMN     "showTimesFor" TEXT,
ADD COLUMN     "specialty" TEXT,
ADD COLUMN     "time" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "_PatientDoctor" ADD CONSTRAINT "_PatientDoctor_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PatientDoctor_AB_unique";
