/*
  Warnings:

  - The values [EFECTIVO,TRANSFERENCIA,CHEQUE,CREDITO] on the enum `TipoCobranza` will be removed. If these variants are still used in the database, this will fail.
  - The `estado_pago` column on the `ordenes_compra_privadas` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `estado_pago` column on the `transportes_asignados` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PAGADO', 'URGENTE', 'PENDIENTE');

-- CreateEnum
CREATE TYPE "TipoProgramacionOp" AS ENUM ('NORMAL', 'URGENTE', 'ESPECIAL');

-- CreateEnum
CREATE TYPE "EstadoProgramacionOp" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA');

-- AlterEnum
BEGIN;
CREATE TYPE "TipoCobranza_new" AS ENUM ('ESPECIAL', 'NORMAL');
ALTER TABLE "gestion_cobranzas" ALTER COLUMN "tipo_cobranza" TYPE "TipoCobranza_new" USING ("tipo_cobranza"::text::"TipoCobranza_new");
ALTER TYPE "TipoCobranza" RENAME TO "TipoCobranza_old";
ALTER TYPE "TipoCobranza_new" RENAME TO "TipoCobranza";
DROP TYPE "TipoCobranza_old";
COMMIT;

-- AlterTable
ALTER TABLE "ordenes_compra_privadas" DROP COLUMN "estado_pago",
ADD COLUMN     "estado_pago" "EstadoPago";

-- AlterTable
ALTER TABLE "transportes_asignados" DROP COLUMN "estado_pago",
ADD COLUMN     "estado_pago" "EstadoPago";

-- CreateTable
CREATE TABLE "historial_modificaciones_op" (
    "id" SERIAL NOT NULL,
    "orden_proveedor_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "campo_modificado" TEXT NOT NULL,
    "valor_anterior" TEXT,
    "valor_nuevo" TEXT,
    "fecha_modificacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "historial_modificaciones_op_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programaciones_entrega" (
    "id" SERIAL NOT NULL,
    "orden_proveedor_id" INTEGER,
    "orden_compra_id" INTEGER,
    "tipo_programacion" "TipoProgramacionOp" NOT NULL,
    "estado_programacion" "EstadoProgramacionOp" NOT NULL,
    "responsable_entrega_id" INTEGER,
    "fecha_maxima_entrega" TIMESTAMP(3),
    "monto" DECIMAL(65,30),
    "orden_electronica_prog" TEXT,
    "orden_fisica_prog" TEXT,
    "departamento_entrega_prog" TEXT,
    "provincia_entrega_prog" TEXT,
    "distrito_entrega_prog" TEXT,
    "documentos_adjuntos_prog" TEXT[],
    "nota_prog" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programaciones_entrega_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "costos_adicionales_op" (
    "id" SERIAL NOT NULL,
    "orden_proveedor_id" INTEGER NOT NULL,
    "concepto" TEXT NOT NULL,
    "descripcion" TEXT,
    "comprobante_url" TEXT,
    "monto" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "costos_adicionales_op_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "historial_modificaciones_op" ADD CONSTRAINT "historial_modificaciones_op_orden_proveedor_id_fkey" FOREIGN KEY ("orden_proveedor_id") REFERENCES "ordenes_proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_modificaciones_op" ADD CONSTRAINT "historial_modificaciones_op_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programaciones_entrega" ADD CONSTRAINT "programaciones_entrega_orden_proveedor_id_fkey" FOREIGN KEY ("orden_proveedor_id") REFERENCES "ordenes_proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programaciones_entrega" ADD CONSTRAINT "programaciones_entrega_orden_compra_id_fkey" FOREIGN KEY ("orden_compra_id") REFERENCES "ordenes_compra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programaciones_entrega" ADD CONSTRAINT "programaciones_entrega_responsable_entrega_id_fkey" FOREIGN KEY ("responsable_entrega_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "costos_adicionales_op" ADD CONSTRAINT "costos_adicionales_op_orden_proveedor_id_fkey" FOREIGN KEY ("orden_proveedor_id") REFERENCES "ordenes_proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
