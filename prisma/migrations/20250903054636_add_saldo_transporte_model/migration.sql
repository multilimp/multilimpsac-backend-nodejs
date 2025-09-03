-- CreateEnum
CREATE TYPE "MovimientoTransporte" AS ENUM ('A_FAVOR', 'DEBE');

-- CreateTable
CREATE TABLE "saldos_transporte" (
    "id" SERIAL NOT NULL,
    "transporteId" INTEGER NOT NULL,
    "tipoMovimiento" "MovimientoTransporte" NOT NULL DEFAULT 'A_FAVOR',
    "monto" DECIMAL(65,30) NOT NULL,
    "descripcion" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saldos_transporte_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "saldos_transporte" ADD CONSTRAINT "saldos_transporte_transporteId_fkey" FOREIGN KEY ("transporteId") REFERENCES "transportes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
