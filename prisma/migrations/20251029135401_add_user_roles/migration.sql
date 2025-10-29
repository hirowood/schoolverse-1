-- AlterTable
ALTER TABLE "User" ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "roles" TEXT[] DEFAULT ARRAY[]::TEXT[];
