/*
  Warnings:

  - The values [ACEPTADA,RECHAZADA] on the enum `CotizacionEstado` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CotizacionEstado_new" AS ENUM ('PENDIENTE', 'APROBADO', 'COTIZADO');
ALTER TABLE "cotizaciones" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "cotizaciones" ALTER COLUMN "estado" TYPE "CotizacionEstado_new" USING ("estado"::text::"CotizacionEstado_new");
ALTER TYPE "CotizacionEstado" RENAME TO "CotizacionEstado_old";
ALTER TYPE "CotizacionEstado_new" RENAME TO "CotizacionEstado";
DROP TYPE "CotizacionEstado_old";
ALTER TABLE "cotizaciones" ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE';
COMMIT;
