-- AlterEnum
ALTER TYPE "TipoDestino" ADD VALUE 'AGENCIA';

-- AlterTable
ALTER TABLE "transportes_asignados" ADD COLUMN     "agencia" TEXT;
