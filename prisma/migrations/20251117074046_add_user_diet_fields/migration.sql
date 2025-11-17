-- AlterTable
ALTER TABLE "User" ADD COLUMN     "goalWeightKg" DOUBLE PRECISION,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "startWeightKg" DOUBLE PRECISION,
ADD COLUMN     "targetDate" TIMESTAMP(3);
