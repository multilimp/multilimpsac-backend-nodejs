-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "permisos" TEXT[] DEFAULT ARRAY[]::TEXT[];
