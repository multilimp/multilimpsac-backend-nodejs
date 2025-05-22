/*
  Warnings:

  - You are about to drop the column `destino` on the `transportes_asignados` table. All the data in the column will be lost.
  - Added the required column `tipo_destino` to the `transportes_asignados` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoDestino" AS ENUM ('ALMACEN', 'CLIENTE');

-- AlterTable
ALTER TABLE "transportes_asignados" DROP COLUMN "destino",
ADD COLUMN     "tipo_destino" "TipoDestino" NOT NULL;
