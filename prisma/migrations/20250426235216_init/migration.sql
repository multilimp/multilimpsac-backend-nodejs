-- CreateEnum
CREATE TYPE "ContactoTipo" AS ENUM ('CLIENTE', 'PROVEEDOR', 'TRANSPORTE');

-- CreateEnum
CREATE TYPE "CotizacionEstado" AS ENUM ('PENDIENTE', 'ACEPTADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "OrdenCompraEstado" AS ENUM ('PENDIENTE', 'FACTURADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "OrdenProveedorEstado" AS ENUM ('PENDIENTE', 'RECIBIDA', 'ANULADA');

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proveedor" (
    "id" SERIAL NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transporte" (
    "id" SERIAL NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Transporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" SERIAL NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contacto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "tipo" "ContactoTipo" NOT NULL,
    "referenciaId" INTEGER NOT NULL,
    "clienteId" INTEGER,
    "proveedorId" INTEGER,
    "transporteId" INTEGER,

    CONSTRAINT "Contacto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Catalogo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "empresaId" INTEGER NOT NULL,

    CONSTRAINT "Catalogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cotizacion" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "CotizacionEstado" NOT NULL DEFAULT 'PENDIENTE',

    CONSTRAINT "Cotizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CotizacionProducto" (
    "id" SERIAL NOT NULL,
    "cotizacionId" INTEGER NOT NULL,
    "nombreProducto" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CotizacionProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdenCompra" (
    "id" SERIAL NOT NULL,
    "cotizacionId" INTEGER,
    "clienteId" INTEGER NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "OrdenCompraEstado" NOT NULL DEFAULT 'PENDIENTE',

    CONSTRAINT "OrdenCompra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdenProveedor" (
    "id" SERIAL NOT NULL,
    "ordenCompraId" INTEGER NOT NULL,
    "proveedorId" INTEGER NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "OrdenProveedorEstado" NOT NULL DEFAULT 'PENDIENTE',

    CONSTRAINT "OrdenProveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpProducto" (
    "id" SERIAL NOT NULL,
    "ordenProveedorId" INTEGER NOT NULL,
    "nombreProducto" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OpProducto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_ruc_key" ON "Cliente"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "Proveedor_ruc_key" ON "Proveedor"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "Transporte_ruc_key" ON "Transporte"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_ruc_key" ON "Empresa"("ruc");

-- AddForeignKey
ALTER TABLE "Contacto" ADD CONSTRAINT "Contacto_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contacto" ADD CONSTRAINT "Contacto_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contacto" ADD CONSTRAINT "Contacto_transporteId_fkey" FOREIGN KEY ("transporteId") REFERENCES "Transporte"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Catalogo" ADD CONSTRAINT "Catalogo_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cotizacion" ADD CONSTRAINT "Cotizacion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cotizacion" ADD CONSTRAINT "Cotizacion_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotizacionProducto" ADD CONSTRAINT "CotizacionProducto_cotizacionId_fkey" FOREIGN KEY ("cotizacionId") REFERENCES "Cotizacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenCompra" ADD CONSTRAINT "OrdenCompra_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenCompra" ADD CONSTRAINT "OrdenCompra_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenCompra" ADD CONSTRAINT "OrdenCompra_cotizacionId_fkey" FOREIGN KEY ("cotizacionId") REFERENCES "Cotizacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenProveedor" ADD CONSTRAINT "OrdenProveedor_ordenCompraId_fkey" FOREIGN KEY ("ordenCompraId") REFERENCES "OrdenCompra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenProveedor" ADD CONSTRAINT "OrdenProveedor_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpProducto" ADD CONSTRAINT "OpProducto_ordenProveedorId_fkey" FOREIGN KEY ("ordenProveedorId") REFERENCES "OrdenProveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
