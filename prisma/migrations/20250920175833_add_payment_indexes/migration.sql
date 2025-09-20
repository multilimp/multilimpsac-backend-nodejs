-- CreateIndex
CREATE INDEX "idx_estado_pago_privada" ON "ordenes_compra_privadas"("estado_pago");

-- CreateIndex
CREATE INDEX "idx_tipo_pago" ON "ordenes_proveedor"("tipo_pago");

-- CreateIndex
CREATE INDEX "idx_estado_pago" ON "transportes_asignados"("estado_pago");
