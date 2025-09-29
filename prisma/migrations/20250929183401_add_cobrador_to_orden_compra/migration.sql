-- AlterTable
ALTER TABLE "ordenes_compra" ADD COLUMN     "cobrador_id" INTEGER;

-- AddForeignKey
ALTER TABLE "ordenes_compra" ADD CONSTRAINT "ordenes_compra_cobrador_id_fkey" FOREIGN KEY ("cobrador_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
