-- AlterTable
ALTER TABLE "transportes_asignados" ADD COLUMN     "guia_remision" TEXT,
ADD COLUMN     "guia_transporte" TEXT,
ADD COLUMN     "monto_flete_pagado" DECIMAL(10,2),
ADD COLUMN     "numero_factura" TEXT;
