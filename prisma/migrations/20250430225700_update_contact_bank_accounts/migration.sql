/*
  Warnings:

  - You are about to drop the `cuentas_bancarias_proveedor` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CuentaBancariaTipo" AS ENUM ('CLIENTE', 'PROVEEDOR', 'TRANSPORTE', 'EMPRESA');

-- DropForeignKey
ALTER TABLE "cuentas_bancarias_proveedor" DROP CONSTRAINT "cuentas_bancarias_proveedor_proveedorId_fkey";

-- AlterTable
ALTER TABLE "contactos" ADD COLUMN     "cumpleanos" TIMESTAMP(3),
ADD COLUMN     "nota" TEXT,
ADD COLUMN     "usuario_destacado" BOOLEAN;

-- AlterTable
ALTER TABLE "transportes" ADD COLUMN     "departamento" TEXT,
ADD COLUMN     "distrito" TEXT,
ADD COLUMN     "provincia" TEXT;

-- DropTable
DROP TABLE "cuentas_bancarias_proveedor";

-- CreateTable
CREATE TABLE "cuentas_bancarias" (
    "id" SERIAL NOT NULL,
    "referencia_id" INTEGER NOT NULL,
    "tipo_cuenta" "CuentaBancariaTipo" NOT NULL,
    "banco" TEXT NOT NULL,
    "numeroCuenta" TEXT NOT NULL,
    "numeroCci" TEXT,
    "moneda" "Moneda" NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "cliente_id" INTEGER,
    "proveedor_id" INTEGER,
    "transporte_id" INTEGER,
    "empresa_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cuentas_bancarias_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cuentas_bancarias" ADD CONSTRAINT "cuentas_bancarias_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas_bancarias" ADD CONSTRAINT "cuentas_bancarias_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas_bancarias" ADD CONSTRAINT "cuentas_bancarias_transporte_id_fkey" FOREIGN KEY ("transporte_id") REFERENCES "transportes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas_bancarias" ADD CONSTRAINT "cuentas_bancarias_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
