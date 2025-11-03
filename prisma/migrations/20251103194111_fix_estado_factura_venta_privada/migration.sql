/*
  Warnings:

  - The `estado_factura` column on the `ordenes_compra_privadas` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ordenes_compra_privadas" DROP COLUMN "estado_factura",
ADD COLUMN     "estado_factura" TEXT;
