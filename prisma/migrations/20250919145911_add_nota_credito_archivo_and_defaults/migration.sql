/*
  Warnings:

  - The `estado_venta` column on the `ordenes_compra` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EstadoRol" AS ENUM ('PENDIENTE', 'COMPLETADO', 'CANCELADO', 'EN_PROCESO');

-- AlterTable
ALTER TABLE "facturaciones" ADD COLUMN     "nota_credito_archivo" TEXT;

-- AlterTable
ALTER TABLE "ordenes_compra" ADD COLUMN     "estado_rol_seguimiento" "EstadoRol" NOT NULL DEFAULT 'PENDIENTE',
DROP COLUMN "estado_venta",
ADD COLUMN     "estado_venta" "EstadoRol" NOT NULL DEFAULT 'PENDIENTE';

-- AlterTable
ALTER TABLE "ordenes_proveedor" ADD COLUMN     "estado_rol_op" "EstadoRol" NOT NULL DEFAULT 'PENDIENTE',
ADD COLUMN     "estado_rol_seguimiento" "EstadoRol" NOT NULL DEFAULT 'PENDIENTE';
