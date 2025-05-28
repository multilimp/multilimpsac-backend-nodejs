/*
  Warnings:

  - You are about to drop the column `descripcion` on the `gestion_cobranzas` table. All the data in the column will be lost.
  - You are about to drop the column `documento_url` on the `gestion_cobranzas` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `gestion_cobranzas` table. All the data in the column will be lost.
  - You are about to drop the column `historial` on the `gestion_cobranzas` table. All the data in the column will be lost.
  - Added the required column `usuario_id` to the `gestion_cobranzas` table without a default value. This is not possible if the table is not empty.
  - Made the column `fecha_gestion` on table `gestion_cobranzas` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TipoCobranza" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'CHEQUE', 'CREDITO');

-- DropForeignKey
ALTER TABLE "gestion_cobranzas" DROP CONSTRAINT "gestion_cobranzas_orden_compra_id_fkey";

-- AlterTable
ALTER TABLE "gestion_cobranzas" DROP COLUMN "descripcion",
DROP COLUMN "documento_url",
DROP COLUMN "estado",
DROP COLUMN "historial",
ADD COLUMN     "archivos_adjuntos_notas_gestion" TEXT[],
ADD COLUMN     "captura_envio_documento_url" TEXT,
ADD COLUMN     "carta_ampliacion_url" TEXT,
ADD COLUMN     "documentos_registrados" TEXT[],
ADD COLUMN     "estado_cobranza" TEXT,
ADD COLUMN     "nota_especial_entrega" TEXT,
ADD COLUMN     "nota_gestion" TEXT,
ADD COLUMN     "orden_compra_privada_id" INTEGER,
ADD COLUMN     "pago_conforme_tesoreria" BOOLEAN DEFAULT false,
ADD COLUMN     "tipo_cobranza" "TipoCobranza",
ADD COLUMN     "usuario_id" INTEGER NOT NULL,
ADD COLUMN     "voucher_pago_url" TEXT,
ALTER COLUMN "orden_compra_id" DROP NOT NULL,
ALTER COLUMN "fecha_gestion" SET NOT NULL,
ALTER COLUMN "fecha_gestion" SET DATA TYPE TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "gestion_cobranzas" ADD CONSTRAINT "gestion_cobranzas_orden_compra_id_fkey" FOREIGN KEY ("orden_compra_id") REFERENCES "ordenes_compra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gestion_cobranzas" ADD CONSTRAINT "gestion_cobranzas_orden_compra_privada_id_fkey" FOREIGN KEY ("orden_compra_privada_id") REFERENCES "ordenes_compra_privadas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gestion_cobranzas" ADD CONSTRAINT "gestion_cobranzas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
