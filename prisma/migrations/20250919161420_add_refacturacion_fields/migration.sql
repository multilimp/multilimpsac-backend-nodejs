-- AlterTable
ALTER TABLE "facturaciones" ADD COLUMN     "es_refacturacion" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "id_factura_original" INTEGER;

-- AddForeignKey
ALTER TABLE "facturaciones" ADD CONSTRAINT "facturaciones_id_factura_original_fkey" FOREIGN KEY ("id_factura_original") REFERENCES "facturaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
