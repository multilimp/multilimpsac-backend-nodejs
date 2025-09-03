/*
  Warnings:

  - The `estado_cobranza` column on the `gestion_cobranzas` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `estado_cobranza` column on the `ordenes_compra` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EstadoCobranza" AS ENUM ('REQ', 'REIT1', 'REIT2', 'OCI', 'PC', 'MAXIMA_AUTORIDAD', 'CARTA_NOTARIAL', 'DENUNCIA_JUDICIAL');

-- AlterTable
ALTER TABLE "gestion_cobranzas" DROP COLUMN "estado_cobranza",
ADD COLUMN     "estado_cobranza" "EstadoCobranza";

-- AlterTable
ALTER TABLE "ordenes_compra" DROP COLUMN "estado_cobranza",
ADD COLUMN     "estado_cobranza" "EstadoCobranza";
