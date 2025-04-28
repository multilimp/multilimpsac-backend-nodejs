-- CreateEnum
CREATE TYPE "ContactoTipo" AS ENUM ('CLIENTE', 'PROVEEDOR', 'TRANSPORTE');

-- CreateEnum
CREATE TYPE "CotizacionEstado" AS ENUM ('PENDIENTE', 'ACEPTADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "OrdenCompraEstado" AS ENUM ('PENDIENTE', 'FACTURADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "OrdenProveedorEstado" AS ENUM ('PENDIENTE', 'RECIBIDA', 'ANULADA');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "TipoPago" AS ENUM ('CONTADO', 'CREDITO', 'ANTICIPADO', 'OTROS');

-- CreateEnum
CREATE TYPE "MovimientoProveedor" AS ENUM ('A_FAVOR', 'DEBE');

-- CreateEnum
CREATE TYPE "TipoCuenta" AS ENUM ('AHORROS', 'CORRIENTE');

-- CreateEnum
CREATE TYPE "Moneda" AS ENUM ('SOLES', 'DOLARES');

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "razon_social" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "codigo_unidad_ejecutora" TEXT,
    "departamento" TEXT,
    "provincia" TEXT,
    "distrito" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id" SERIAL NOT NULL,
    "razon_social" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "departamento" TEXT,
    "provincia" TEXT,
    "distrito" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saldos_proveedor" (
    "id" SERIAL NOT NULL,
    "proveedorId" INTEGER NOT NULL,
    "tipoMovimiento" "MovimientoProveedor" NOT NULL DEFAULT 'A_FAVOR',
    "monto" DOUBLE PRECISION NOT NULL,
    "descripcion" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saldos_proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuentas_bancarias_proveedor" (
    "id" SERIAL NOT NULL,
    "proveedorId" INTEGER NOT NULL,
    "banco" TEXT NOT NULL,
    "numeroCuenta" TEXT NOT NULL,
    "numeroCci" TEXT,
    "tipoCuenta" "TipoCuenta" NOT NULL,
    "moneda" "Moneda" NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cuentas_bancarias_proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transportes" (
    "id" SERIAL NOT NULL,
    "razon_social" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transportes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresas" (
    "id" SERIAL NOT NULL,
    "razon_social" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "departamento" TEXT,
    "provincia" TEXT,
    "distrito" TEXT,
    "logo" TEXT,
    "direcciones" TEXT,
    "web" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contactos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "tipo" "ContactoTipo" NOT NULL,
    "referencia_id" INTEGER NOT NULL,
    "cliente_id" INTEGER,
    "proveedor_id" INTEGER,
    "transporte_id" INTEGER,
    "cargo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contactos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogos_empresa" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "empresa_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalogos_empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotizaciones" (
    "id" SERIAL NOT NULL,
    "codigo_cotizacion" TEXT NOT NULL,
    "empresa_id" INTEGER NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "contacto_cliente_id" INTEGER,
    "monto_total" DOUBLE PRECISION NOT NULL,
    "tipo_pago" "TipoPago" NOT NULL,
    "nota_pago" TEXT,
    "nota_pedido" TEXT,
    "direccion_entrega" TEXT,
    "distrito_entrega" TEXT,
    "provincia_entrega" TEXT,
    "departamento_entrega" TEXT,
    "referencia_entrega" TEXT,
    "estado" "CotizacionEstado" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_cotizacion" TIMESTAMP(3) NOT NULL,
    "fecha_entrega" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cotizaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotizacion_productos" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "unidad_medida" TEXT,
    "cantidad" INTEGER NOT NULL,
    "cantidad_almacen" INTEGER,
    "cantidad_total" INTEGER NOT NULL,
    "precio_unitario" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "cotizacion_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cotizacion_productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes_compra" (
    "id" SERIAL NOT NULL,
    "codigo_venta" TEXT NOT NULL,
    "fecha_emision" DATE,
    "archivo_oc" TEXT,
    "empresa_id" INTEGER,
    "cliente_id" INTEGER,
    "contacto_cliente_id" INTEGER,
    "catalogo_empresa_id" INTEGER,
    "venta_privada" BOOLEAN NOT NULL DEFAULT false,
    "provincia_entrega" TEXT,
    "distrito_entrega" TEXT,
    "departamento_entrega" TEXT,
    "direccion_entrega" TEXT,
    "referencia_entrega" TEXT,
    "fecha_entrega" DATE,
    "monto_venta" DECIMAL(10,2),
    "fecha_form" DATE,
    "fecha_max_form" DATE,
    "productos" JSONB,
    "documento_oce" TEXT,
    "documento_ocf" TEXT,
    "siaf" TEXT,
    "etapa_siaf" TEXT,
    "fecha_siaf" DATE,
    "documento_peru_compras" TEXT,
    "fecha_peru_compras" DATE,
    "fecha_entrega_oc" DATE,
    "penalidad" DECIMAL(10,2),
    "neto_cobrado" DECIMAL(10,2),
    "estado_cobranza" TEXT,
    "fecha_estado_cobranza" DATE,
    "fecha_proxima_gestion" DATE,
    "etapa_actual" TEXT NOT NULL DEFAULT 'creacion',
    "estado_activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordenes_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgrupacionOrdenCompra" (
    "id" SERIAL NOT NULL,
    "codigoGrupo" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgrupacionOrdenCompra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdenCompraAgrupada" (
    "id" SERIAL NOT NULL,
    "agrupacionOrdenCompraId" INTEGER NOT NULL,
    "ordenCompraId" INTEGER NOT NULL,

    CONSTRAINT "OrdenCompraAgrupada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes_compra_privadas" (
    "id" SERIAL NOT NULL,
    "orden_compra_id" INTEGER NOT NULL,
    "cliente_id" INTEGER,
    "contacto_cliente_id" INTEGER,
    "estado_pago" TEXT,
    "fecha_pago" DATE,
    "documento_pago" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordenes_compra_privadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos_ordenes_compra_privadas" (
    "id" SERIAL NOT NULL,
    "orden_compra_privada_id" INTEGER NOT NULL,
    "fecha_pago" DATE,
    "banco_pago" TEXT,
    "descripcion_pago" TEXT,
    "archivo_pago" TEXT,
    "monto_pago" DECIMAL(10,2),
    "estado_pago" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagos_ordenes_compra_privadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes_proveedor" (
    "id" SERIAL NOT NULL,
    "codigo_op" VARCHAR(255) NOT NULL,
    "empresa_id" INTEGER,
    "proveedor_id" INTEGER,
    "contacto_proveedor_id" INTEGER,
    "fecha_despacho" TIMESTAMP(3),
    "fecha_programada" TIMESTAMP(3),
    "fecha_recepcion" TIMESTAMP(3),
    "nota_pedido" TEXT,
    "total_proveedor" DOUBLE PRECISION,
    "tipo_pago" TEXT,
    "nota_pago" TEXT,
    "nota_gestion_op" TEXT,
    "tipo_entrega" TEXT,
    "retorno_mercaderia" TEXT,
    "estado_op" TEXT,
    "fecha_entrega" TEXT,
    "cargo_oea" TEXT,
    "etiquetado" TEXT,
    "embalaje" TEXT,
    "observaciones" TEXT,
    "nota_adicional" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden_compra_id" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "ordenes_proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos_orden_proveedor" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "unidad_medida" TEXT,
    "cantidad" INTEGER NOT NULL,
    "cantidad_almacen" INTEGER,
    "cantidad_total" INTEGER NOT NULL,
    "precio_unitario" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "orden_proveedor_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_orden_proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transportes_asignados" (
    "id" SERIAL NOT NULL,
    "codigo_transporte" TEXT NOT NULL,
    "transporte_id" INTEGER NOT NULL,
    "orden_proveedor_id" INTEGER NOT NULL,
    "contacto_transporte_id" INTEGER,
    "destino" TEXT,
    "region" TEXT,
    "provincia" TEXT,
    "distrito" TEXT,
    "direccion" TEXT,
    "nota_transporte" TEXT,
    "cotizacion_transporte" TEXT,
    "estado_pago" TEXT,
    "monto_flete" DECIMAL(10,2),
    "grt" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transportes_asignados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos_transportes_asignados" (
    "id" SERIAL NOT NULL,
    "transporte_asignado_id" INTEGER NOT NULL,
    "fecha_pago" DATE,
    "banco_pago" TEXT,
    "descripcion_pago" TEXT,
    "archivo_pago" TEXT,
    "monto_pago" DECIMAL(10,2),
    "estado_pago" BOOLEAN DEFAULT false,
    "activo" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagos_transportes_asignados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos_orden_proveedor" (
    "id" SERIAL NOT NULL,
    "fecha_pago" TIMESTAMP(3),
    "banco_pago" VARCHAR(255),
    "descripcion_pago" TEXT,
    "archivo_pago" VARCHAR(255),
    "monto_pago" DOUBLE PRECISION,
    "estado_pago" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden_proveedor_id" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "pagos_orden_proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "unidad_medida" TEXT,
    "precio_base" DOUBLE PRECISION,
    "estado" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_productos" (
    "id" SERIAL NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "almacen_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "almacenes" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "ciudad" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "almacenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturaciones" (
    "id" SERIAL NOT NULL,
    "orden_compra_id" INTEGER NOT NULL,
    "factura" TEXT,
    "fecha_factura" DATE,
    "grr" TEXT,
    "retencion" DECIMAL(10,2),
    "detraccion" DECIMAL(10,2),
    "forma_envio_factura" TEXT,
    "estado" INTEGER DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facturaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gestion_cobranzas" (
    "id" SERIAL NOT NULL,
    "orden_compra_id" INTEGER NOT NULL,
    "historial" TEXT,
    "descripcion" TEXT,
    "fecha_gestion" DATE,
    "documento_url" TEXT,
    "estado" INTEGER DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gestion_cobranzas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_ruc_key" ON "clientes"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "proveedores_ruc_key" ON "proveedores"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "transportes_ruc_key" ON "transportes"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_ruc_key" ON "empresas"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "cotizaciones_codigo_cotizacion_key" ON "cotizaciones"("codigo_cotizacion");

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_compra_codigo_venta_key" ON "ordenes_compra"("codigo_venta");

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_compra_privadas_orden_compra_id_key" ON "ordenes_compra_privadas"("orden_compra_id");

-- CreateIndex
CREATE UNIQUE INDEX "stock_productos_producto_id_almacen_id_key" ON "stock_productos"("producto_id", "almacen_id");

-- AddForeignKey
ALTER TABLE "saldos_proveedor" ADD CONSTRAINT "saldos_proveedor_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "proveedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas_bancarias_proveedor" ADD CONSTRAINT "cuentas_bancarias_proveedor_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "proveedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contactos" ADD CONSTRAINT "contactos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contactos" ADD CONSTRAINT "contactos_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contactos" ADD CONSTRAINT "contactos_transporte_id_fkey" FOREIGN KEY ("transporte_id") REFERENCES "transportes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalogos_empresa" ADD CONSTRAINT "catalogos_empresa_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_contacto_cliente_id_fkey" FOREIGN KEY ("contacto_cliente_id") REFERENCES "contactos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizacion_productos" ADD CONSTRAINT "cotizacion_productos_cotizacion_id_fkey" FOREIGN KEY ("cotizacion_id") REFERENCES "cotizaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra" ADD CONSTRAINT "ordenes_compra_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra" ADD CONSTRAINT "ordenes_compra_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra" ADD CONSTRAINT "ordenes_compra_contacto_cliente_id_fkey" FOREIGN KEY ("contacto_cliente_id") REFERENCES "contactos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra" ADD CONSTRAINT "ordenes_compra_catalogo_empresa_id_fkey" FOREIGN KEY ("catalogo_empresa_id") REFERENCES "catalogos_empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenCompraAgrupada" ADD CONSTRAINT "OrdenCompraAgrupada_agrupacionOrdenCompraId_fkey" FOREIGN KEY ("agrupacionOrdenCompraId") REFERENCES "AgrupacionOrdenCompra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenCompraAgrupada" ADD CONSTRAINT "OrdenCompraAgrupada_ordenCompraId_fkey" FOREIGN KEY ("ordenCompraId") REFERENCES "ordenes_compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra_privadas" ADD CONSTRAINT "ordenes_compra_privadas_orden_compra_id_fkey" FOREIGN KEY ("orden_compra_id") REFERENCES "ordenes_compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra_privadas" ADD CONSTRAINT "ordenes_compra_privadas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra_privadas" ADD CONSTRAINT "ordenes_compra_privadas_contacto_cliente_id_fkey" FOREIGN KEY ("contacto_cliente_id") REFERENCES "contactos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_ordenes_compra_privadas" ADD CONSTRAINT "pagos_ordenes_compra_privadas_orden_compra_privada_id_fkey" FOREIGN KEY ("orden_compra_privada_id") REFERENCES "ordenes_compra_privadas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_proveedor" ADD CONSTRAINT "ordenes_proveedor_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_proveedor" ADD CONSTRAINT "ordenes_proveedor_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_proveedor" ADD CONSTRAINT "ordenes_proveedor_contacto_proveedor_id_fkey" FOREIGN KEY ("contacto_proveedor_id") REFERENCES "contactos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_proveedor" ADD CONSTRAINT "ordenes_proveedor_orden_compra_id_fkey" FOREIGN KEY ("orden_compra_id") REFERENCES "ordenes_compra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_orden_proveedor" ADD CONSTRAINT "productos_orden_proveedor_orden_proveedor_id_fkey" FOREIGN KEY ("orden_proveedor_id") REFERENCES "ordenes_proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportes_asignados" ADD CONSTRAINT "transportes_asignados_transporte_id_fkey" FOREIGN KEY ("transporte_id") REFERENCES "transportes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportes_asignados" ADD CONSTRAINT "transportes_asignados_orden_proveedor_id_fkey" FOREIGN KEY ("orden_proveedor_id") REFERENCES "ordenes_proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportes_asignados" ADD CONSTRAINT "transportes_asignados_contacto_transporte_id_fkey" FOREIGN KEY ("contacto_transporte_id") REFERENCES "contactos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_transportes_asignados" ADD CONSTRAINT "pagos_transportes_asignados_transporte_asignado_id_fkey" FOREIGN KEY ("transporte_asignado_id") REFERENCES "transportes_asignados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_orden_proveedor" ADD CONSTRAINT "pagos_orden_proveedor_orden_proveedor_id_fkey" FOREIGN KEY ("orden_proveedor_id") REFERENCES "ordenes_proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_productos" ADD CONSTRAINT "stock_productos_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_productos" ADD CONSTRAINT "stock_productos_almacen_id_fkey" FOREIGN KEY ("almacen_id") REFERENCES "almacenes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturaciones" ADD CONSTRAINT "facturaciones_orden_compra_id_fkey" FOREIGN KEY ("orden_compra_id") REFERENCES "ordenes_compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gestion_cobranzas" ADD CONSTRAINT "gestion_cobranzas_orden_compra_id_fkey" FOREIGN KEY ("orden_compra_id") REFERENCES "ordenes_compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
