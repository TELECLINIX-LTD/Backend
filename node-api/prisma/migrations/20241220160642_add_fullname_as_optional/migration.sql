-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailToken" TEXT,
ALTER COLUMN "fullName" DROP NOT NULL;
