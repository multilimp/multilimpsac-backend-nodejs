/*
  Warnings:

  - You are about to alter the column `precio_unitario` on the `cotizacion_productos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `total` on the `cotizacion_productos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `monto_total` on the `cotizaciones` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the column `createdAt` on the `cuentas_bancarias_proveedor` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `cuentas_bancarias_proveedor` table. All the data in the column will be lost.
  - You are about to alter the column `total_proveedor` on the `ordenes_proveedor` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `monto_pago` on the `pagos_orden_proveedor` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,4)`.
  - You are about to alter the column `precio_base` on the `productos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,4)`.
  - You are about to alter the column `precio_unitario` on the `productos_orden_proveedor` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `total` on the `productos_orden_proveedor` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the column `createdAt` on the `saldos_proveedor` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `saldos_proveedor` table. All the data in the column will be lost.
  - You are about to alter the column `monto` on the `saldos_proveedor` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the `AgrupacionOrdenCompra` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrdenCompraAgrupada` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `catalogos_empresa` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updated_at` to the `cuentas_bancarias_proveedor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `saldos_proveedor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrdenCompraAgrupada" DROP CONSTRAINT "OrdenCompraAgrupada_agrupacionOrdenCompraId_fkey";

-- DropForeignKey
ALTER TABLE "OrdenCompraAgrupada" DROP CONSTRAINT "OrdenCompraAgrupada_ordenCompraId_fkey";

-- DropForeignKey
ALTER TABLE "catalogos_empresa" DROP CONSTRAINT "catalogos_empresa_empresa_id_fkey";

-- DropForeignKey
ALTER TABLE "ordenes_compra" DROP CONSTRAINT "ordenes_compra_catalogo_empresa_id_fkey";

-- AlterTable
ALTER TABLE "cotizacion_productos" ALTER COLUMN "precio_unitario" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "total" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "cotizaciones" ALTER COLUMN "monto_total" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "cuentas_bancarias_proveedor" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ordenes_proveedor" ALTER COLUMN "total_proveedor" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "pagos_orden_proveedor" ALTER COLUMN "monto_pago" SET DATA TYPE DECIMAL(10,4);

-- AlterTable
ALTER TABLE "productos" ALTER COLUMN "precio_base" SET DATA TYPE DECIMAL(10,4);

-- AlterTable
ALTER TABLE "productos_orden_proveedor" ALTER COLUMN "precio_unitario" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "total" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "saldos_proveedor" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "monto" SET DATA TYPE DECIMAL(65,30);

-- DropTable
DROP TABLE "AgrupacionOrdenCompra";

-- DropTable
DROP TABLE "OrdenCompraAgrupada";

-- DropTable
DROP TABLE "catalogos_empresa";

-- CreateTable
CREATE TABLE "catalogos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "empresa_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalogos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agrupaciones_orden_compra" (
    "id" SERIAL NOT NULL,
    "codigo_grupo" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agrupaciones_orden_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes_compra_agrupadas" (
    "id" SERIAL NOT NULL,
    "agrupacion_orden_compra_id" INTEGER NOT NULL,
    "orden_compra_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordenes_compra_agrupadas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "catalogos" ADD CONSTRAINT "catalogos_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra" ADD CONSTRAINT "ordenes_compra_catalogo_empresa_id_fkey" FOREIGN KEY ("catalogo_empresa_id") REFERENCES "catalogos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra_agrupadas" ADD CONSTRAINT "ordenes_compra_agrupadas_agrupacion_orden_compra_id_fkey" FOREIGN KEY ("agrupacion_orden_compra_id") REFERENCES "agrupaciones_orden_compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra_agrupadas" ADD CONSTRAINT "ordenes_compra_agrupadas_orden_compra_id_fkey" FOREIGN KEY ("orden_compra_id") REFERENCES "ordenes_compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
