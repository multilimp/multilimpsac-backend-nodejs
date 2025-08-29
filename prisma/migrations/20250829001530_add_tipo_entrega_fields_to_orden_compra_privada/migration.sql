-- CreateEnum
CREATE TYPE "TipoEntregaPrivada" AS ENUM ('ENTREGA_DOMICILIO', 'ENTREGA_AGENCIA', 'RECOJO_TIENDA');

-- AlterTable
ALTER TABLE "ordenes_compra_privadas" ADD COLUMN     "destino_final" TEXT,
ADD COLUMN     "nombre_agencia" TEXT,
ADD COLUMN     "nombre_entidad" TEXT,
ADD COLUMN     "tipo_destino" "TipoEntregaPrivada";
