-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "uploadedResults" TEXT;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "weight" DOUBLE PRECISION;
