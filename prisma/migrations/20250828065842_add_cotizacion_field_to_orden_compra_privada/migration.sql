/*
  Warnings:

  - You are about to drop the column `agencia` on the `transportes_asignados` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[codigo_grupo]` on the table `agrupaciones_orden_compra` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ordenes_compra_privadas" ADD COLUMN     "cotizacion" TEXT;

-- AlterTable
ALTER TABLE "transportes_asignados" DROP COLUMN "agencia";

-- CreateIndex
CREATE UNIQUE INDEX "agrupaciones_orden_compra_codigo_grupo_key" ON "agrupaciones_orden_compra"("codigo_grupo");
