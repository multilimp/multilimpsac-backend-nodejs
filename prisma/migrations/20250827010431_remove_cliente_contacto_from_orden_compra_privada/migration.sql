/*
  Warnings:

  - You are about to drop the column `cliente_id` on the `ordenes_compra_privadas` table. All the data in the column will be lost.
  - You are about to drop the column `contacto_cliente_id` on the `ordenes_compra_privadas` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ordenes_compra_privadas" DROP CONSTRAINT "ordenes_compra_privadas_cliente_id_fkey";

-- DropForeignKey
ALTER TABLE "ordenes_compra_privadas" DROP CONSTRAINT "ordenes_compra_privadas_contacto_cliente_id_fkey";

-- AlterTable
ALTER TABLE "ordenes_compra_privadas" DROP COLUMN "cliente_id",
DROP COLUMN "contacto_cliente_id";
