/*
  Warnings:

  - The values [RECOJO_TIENDA] on the enum `TipoEntregaPrivada` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TipoEntregaPrivada_new" AS ENUM ('ENTREGA_DOMICILIO', 'ENTREGA_AGENCIA', 'RECOJO_ALMACEN');
ALTER TABLE "ordenes_compra_privadas" ALTER COLUMN "tipo_destino" TYPE "TipoEntregaPrivada_new" USING ("tipo_destino"::text::"TipoEntregaPrivada_new");
ALTER TYPE "TipoEntregaPrivada" RENAME TO "TipoEntregaPrivada_old";
ALTER TYPE "TipoEntregaPrivada_new" RENAME TO "TipoEntregaPrivada";
DROP TYPE "TipoEntregaPrivada_old";
COMMIT;
