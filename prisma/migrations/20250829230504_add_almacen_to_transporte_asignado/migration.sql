-- AlterTable
ALTER TABLE "transportes_asignados" ADD COLUMN     "almacen_id" INTEGER;

-- AddForeignKey
ALTER TABLE "transportes_asignados" ADD CONSTRAINT "transportes_asignados_almacen_id_fkey" FOREIGN KEY ("almacen_id") REFERENCES "almacenes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
