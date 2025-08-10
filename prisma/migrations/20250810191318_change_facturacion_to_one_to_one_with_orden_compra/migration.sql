/*
  Warnings:

  - A unique constraint covering the columns `[orden_compra_id]` on the table `facturaciones` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "facturaciones_orden_compra_id_key" ON "facturaciones"("orden_compra_id");
