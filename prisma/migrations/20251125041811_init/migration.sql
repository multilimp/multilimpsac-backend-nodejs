-- CreateEnum
CREATE TYPE "TipoDestino" AS ENUM ('ALMACEN', 'CLIENTE', 'AGENCIA');

-- CreateEnum
CREATE TYPE "TipoEntregaPrivada" AS ENUM ('ENTREGA_DOMICILIO', 'ENTREGA_AGENCIA', 'RECOJO_ALMACEN');

-- CreateEnum
CREATE TYPE "ContactoTipo" AS ENUM ('CLIENTE', 'PROVEEDOR', 'TRANSPORTE');

-- CreateEnum
CREATE TYPE "CotizacionEstado" AS ENUM ('PENDIENTE', 'APROBADO', 'COTIZADO');

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
CREATE TYPE "EstadoRol" AS ENUM ('PENDIENTE', 'COMPLETADO', 'CANCELADO', 'EN_PROCESO', 'ENTREGADO', 'COMPLETO', 'ANULADO');

-- CreateEnum
CREATE TYPE "MovimientoTransporte" AS ENUM ('A_FAVOR', 'DEBE');

-- CreateEnum
CREATE TYPE "TipoCuenta" AS ENUM ('AHORROS', 'CORRIENTE');

-- CreateEnum
CREATE TYPE "Moneda" AS ENUM ('SOLES', 'DOLARES');

-- CreateEnum
CREATE TYPE "CuentaBancariaTipo" AS ENUM ('CLIENTE', 'PROVEEDOR', 'TRANSPORTE', 'EMPRESA');

-- CreateEnum
CREATE TYPE "TipoCobranza" AS ENUM ('ESPECIAL', 'NORMAL');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PAGADO', 'URGENTE', 'PENDIENTE', 'PAGO_ENVIADO_VERIFICADO');

-- CreateEnum
CREATE TYPE "TipoProgramacionOp" AS ENUM ('NORMAL', 'URGENTE', 'ESPECIAL');

-- CreateEnum
CREATE TYPE "EstadoCobranza" AS ENUM ('REQ', 'REIT1', 'REIT2', 'OCI', 'PC', 'MAXIMA_AUTORIDAD', 'CARTA_NOTARIAL', 'DENUNCIA_JUDICIAL');

-- CreateEnum
CREATE TYPE "EstadoProgramacionOp" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA');

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
    "sede" TEXT,
    "promedio_cobranza" DECIMAL(10,2),

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
    "monto" DECIMAL(65,30) NOT NULL,
    "descripcion" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "banco" TEXT,

    CONSTRAINT "saldos_proveedor_pkey" PRIMARY KEY ("id")
);

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
    "banco" TEXT,

    CONSTRAINT "saldos_transporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuentas_bancarias" (
    "id" SERIAL NOT NULL,
    "referencia_id" INTEGER NOT NULL,
    "tipo_cuenta" "CuentaBancariaTipo" NOT NULL,
    "banco" TEXT NOT NULL,
    "numeroCuenta" TEXT NOT NULL,
    "numeroCci" TEXT,
    "moneda" "Moneda" NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "cliente_id" INTEGER,
    "proveedor_id" INTEGER,
    "transporte_id" INTEGER,
    "empresa_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cuentas_bancarias_pkey" PRIMARY KEY ("id")
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
    "cobertura" TEXT,
    "departamento" TEXT,
    "distrito" TEXT,
    "provincia" TEXT,

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
    "cumpleanos" TIMESTAMP(3),
    "nota" TEXT,
    "usuario_destacado" BOOLEAN,

    CONSTRAINT "contactos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "empresa_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalogos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotizaciones" (
    "id" SERIAL NOT NULL,
    "codigo_cotizacion" TEXT NOT NULL,
    "empresa_id" INTEGER NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "contacto_cliente_id" INTEGER,
    "monto_total" DECIMAL(65,30) NOT NULL,
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
    "precio_unitario" DECIMAL(65,30) NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,
    "cotizacion_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "cantidad_cliente" INTEGER,

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
    "fecha_estado_cobranza" DATE,
    "fecha_proxima_gestion" DATE,
    "etapa_actual" TEXT NOT NULL DEFAULT 'creacion',
    "estado_activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "codigo_ocf" TEXT,
    "estado_cobranza" "EstadoCobranza",
    "multiple_fuentes_financiamiento" BOOLEAN NOT NULL DEFAULT false,
    "estado_rol_seguimiento" "EstadoRol" NOT NULL DEFAULT 'PENDIENTE',
    "estado_venta" "EstadoRol" NOT NULL DEFAULT 'PENDIENTE',
    "cobrador_id" INTEGER,
    "carta_cci" TEXT,
    "carta_garantia" TEXT,
    "carta_ampliacion" TEXT,
    "estado_facturacion" "EstadoRol" NOT NULL DEFAULT 'PENDIENTE',
    "estado_cobranza_rol" "EstadoRol" NOT NULL DEFAULT 'PENDIENTE',

    CONSTRAINT "ordenes_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agrupaciones_orden_compra" (
    "id" SERIAL NOT NULL,
    "codigo_grupo" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agrupaciones_orden_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes_compra_agrupadas" (
    "id" SERIAL NOT NULL,
    "agrupacion_orden_compra_id" INTEGER NOT NULL,
    "orden_compra_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordenes_compra_agrupadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes_compra_privadas" (
    "id" SERIAL NOT NULL,
    "orden_compra_id" INTEGER NOT NULL,
    "fecha_pago" DATE,
    "fecha_factura" DATE,
    "documento_pago" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "estado_pago" "EstadoPago",
    "estado_factura" TEXT,
    "nota_pago" TEXT,
    "documento_cotizacion" TEXT,
    "cotizacion" TEXT,
    "destino_final" TEXT,
    "nombre_agencia" TEXT,
    "nombre_entidad" TEXT,
    "tipo_destino" "TipoEntregaPrivada",

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
    "total_proveedor" DECIMAL(65,30),
    "tipo_pago" TEXT,
    "forma_pago" TEXT,
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
    "estado_rol_op" "EstadoRol" NOT NULL DEFAULT 'PENDIENTE',
    "estado_rol_seguimiento" "EstadoRol" NOT NULL DEFAULT 'PENDIENTE',
    "nota_cobranzas" TEXT,
    "nota_observaciones" TEXT,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,

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
    "precio_unitario" DECIMAL(65,30) NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,
    "orden_proveedor_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "cantidad_cliente" INTEGER,

    CONSTRAINT "productos_orden_proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transportes_asignados" (
    "id" SERIAL NOT NULL,
    "codigo_transporte" TEXT NOT NULL,
    "transporte_id" INTEGER NOT NULL,
    "orden_proveedor_id" INTEGER NOT NULL,
    "contacto_transporte_id" INTEGER,
    "region" TEXT,
    "provincia" TEXT,
    "distrito" TEXT,
    "direccion" TEXT,
    "nota_transporte" TEXT,
    "cotizacion_transporte" TEXT,
    "monto_flete" DECIMAL(10,2),
    "grt" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "tipo_destino" "TipoDestino" NOT NULL,
    "estado_pago" "EstadoPago",
    "nota_pago" TEXT,
    "almacen_id" INTEGER,
    "guia_remision" TEXT,
    "guia_transporte" TEXT,
    "monto_flete_pagado" DECIMAL(10,2),
    "numero_factura" TEXT,
    "archivo_factura" TEXT,

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
    "monto_pago" DECIMAL(10,4),
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
    "precio_base" DECIMAL(10,4),
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
CREATE TABLE "movimientos_stock" (
    "id" SERIAL NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "almacen_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "referencia" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientos_stock_pkey" PRIMARY KEY ("id")
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
    "nota_credito_archivo" TEXT,
    "nota_credito_texto" TEXT,
    "es_refacturacion" BOOLEAN NOT NULL DEFAULT false,
    "id_factura_original" INTEGER,
    "factura_archivo" TEXT,
    "grr_archivo" TEXT,
    "motivo_refacturacion" TEXT,

    CONSTRAINT "facturaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gestion_cobranzas" (
    "id" SERIAL NOT NULL,
    "orden_compra_id" INTEGER,
    "fecha_gestion" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archivos_adjuntos_notas_gestion" TEXT[],
    "captura_envio_documento_url" TEXT,
    "carta_ampliacion_url" TEXT,
    "documentos_registrados" TEXT[],
    "nota_especial_entrega" TEXT,
    "nota_gestion" TEXT,
    "orden_compra_privada_id" INTEGER,
    "pago_conforme_tesoreria" BOOLEAN DEFAULT false,
    "tipo_cobranza" "TipoCobranza",
    "usuario_id" INTEGER NOT NULL,
    "voucher_pago_url" TEXT,
    "estado_cobranza" "EstadoCobranza",

    CONSTRAINT "gestion_cobranzas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "foto" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "departamento" TEXT,
    "telefono" TEXT,
    "ubicacion" TEXT,
    "permisos" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_modificaciones_op" (
    "id" SERIAL NOT NULL,
    "orden_proveedor_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "campo_modificado" TEXT NOT NULL,
    "valor_anterior" TEXT,
    "valor_nuevo" TEXT,
    "fecha_modificacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "historial_modificaciones_op_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programaciones_entrega" (
    "id" SERIAL NOT NULL,
    "orden_proveedor_id" INTEGER,
    "orden_compra_id" INTEGER,
    "tipo_programacion" "TipoProgramacionOp" NOT NULL,
    "estado_programacion" "EstadoProgramacionOp" NOT NULL,
    "responsable_entrega_id" INTEGER,
    "fecha_maxima_entrega" TIMESTAMP(3),
    "monto" DECIMAL(65,30),
    "orden_electronica_prog" TEXT,
    "orden_fisica_prog" TEXT,
    "departamento_entrega_prog" TEXT,
    "provincia_entrega_prog" TEXT,
    "distrito_entrega_prog" TEXT,
    "documentos_adjuntos_prog" TEXT[],
    "nota_prog" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programaciones_entrega_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "costos_adicionales_op" (
    "id" SERIAL NOT NULL,
    "orden_proveedor_id" INTEGER NOT NULL,
    "concepto" TEXT NOT NULL,
    "descripcion" TEXT,
    "comprobante_url" TEXT,
    "monto" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "costos_adicionales_op_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archivos_adjuntos" (
    "id" SERIAL NOT NULL,
    "orden_compra_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tamano" INTEGER NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "archivos_adjuntos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresas_ruc_key" ON "empresas"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "cotizaciones_codigo_cotizacion_key" ON "cotizaciones"("codigo_cotizacion");

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_compra_codigo_venta_key" ON "ordenes_compra"("codigo_venta");

-- CreateIndex
CREATE UNIQUE INDEX "agrupaciones_orden_compra_codigo_grupo_key" ON "agrupaciones_orden_compra"("codigo_grupo");

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_compra_privadas_orden_compra_id_key" ON "ordenes_compra_privadas"("orden_compra_id");

-- CreateIndex
CREATE INDEX "idx_estado_pago_privada" ON "ordenes_compra_privadas"("estado_pago");

-- CreateIndex
CREATE INDEX "idx_tipo_pago" ON "ordenes_proveedor"("tipo_pago");

-- CreateIndex
CREATE INDEX "idx_estado_pago" ON "transportes_asignados"("estado_pago");

-- CreateIndex
CREATE UNIQUE INDEX "stock_productos_producto_id_almacen_id_key" ON "stock_productos"("producto_id", "almacen_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "saldos_proveedor" ADD CONSTRAINT "saldos_proveedor_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "proveedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saldos_transporte" ADD CONSTRAINT "saldos_transporte_transporteId_fkey" FOREIGN KEY ("transporteId") REFERENCES "transportes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas_bancarias" ADD CONSTRAINT "cuentas_bancarias_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas_bancarias" ADD CONSTRAINT "cuentas_bancarias_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas_bancarias" ADD CONSTRAINT "cuentas_bancarias_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas_bancarias" ADD CONSTRAINT "cuentas_bancarias_transporte_id_fkey" FOREIGN KEY ("transporte_id") REFERENCES "transportes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contactos" ADD CONSTRAINT "contactos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contactos" ADD CONSTRAINT "contactos_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contactos" ADD CONSTRAINT "contactos_transporte_id_fkey" FOREIGN KEY ("transporte_id") REFERENCES "transportes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalogos" ADD CONSTRAINT "catalogos_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_contacto_cliente_id_fkey" FOREIGN KEY ("contacto_cliente_id") REFERENCES "contactos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizacion_productos" ADD CONSTRAINT "cotizacion_productos_cotizacion_id_fkey" FOREIGN KEY ("cotizacion_id") REFERENCES "cotizaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra" ADD CONSTRAINT "ordenes_compra_catalogo_empresa_id_fkey" FOREIGN KEY ("catalogo_empresa_id") REFERENCES "catalogos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra" ADD CONSTRAINT "ordenes_compra_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra" ADD CONSTRAINT "ordenes_compra_cobrador_id_fkey" FOREIGN KEY ("cobrador_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra" ADD CONSTRAINT "ordenes_compra_contacto_cliente_id_fkey" FOREIGN KEY ("contacto_cliente_id") REFERENCES "contactos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra" ADD CONSTRAINT "ordenes_compra_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra_agrupadas" ADD CONSTRAINT "ordenes_compra_agrupadas_agrupacion_orden_compra_id_fkey" FOREIGN KEY ("agrupacion_orden_compra_id") REFERENCES "agrupaciones_orden_compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra_agrupadas" ADD CONSTRAINT "ordenes_compra_agrupadas_orden_compra_id_fkey" FOREIGN KEY ("orden_compra_id") REFERENCES "ordenes_compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra_privadas" ADD CONSTRAINT "ordenes_compra_privadas_orden_compra_id_fkey" FOREIGN KEY ("orden_compra_id") REFERENCES "ordenes_compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_ordenes_compra_privadas" ADD CONSTRAINT "pagos_ordenes_compra_privadas_orden_compra_privada_id_fkey" FOREIGN KEY ("orden_compra_privada_id") REFERENCES "ordenes_compra_privadas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_proveedor" ADD CONSTRAINT "ordenes_proveedor_contacto_proveedor_id_fkey" FOREIGN KEY ("contacto_proveedor_id") REFERENCES "contactos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_proveedor" ADD CONSTRAINT "ordenes_proveedor_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_proveedor" ADD CONSTRAINT "ordenes_proveedor_orden_compra_id_fkey" FOREIGN KEY ("orden_compra_id") REFERENCES "ordenes_compra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_proveedor" ADD CONSTRAINT "ordenes_proveedor_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_orden_proveedor" ADD CONSTRAINT "productos_orden_proveedor_orden_proveedor_id_fkey" FOREIGN KEY ("orden_proveedor_id") REFERENCES "ordenes_proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportes_asignados" ADD CONSTRAINT "transportes_asignados_almacen_id_fkey" FOREIGN KEY ("almacen_id") REFERENCES "almacenes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportes_asignados" ADD CONSTRAINT "transportes_asignados_contacto_transporte_id_fkey" FOREIGN KEY ("contacto_transporte_id") REFERENCES "contactos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportes_asignados" ADD CONSTRAINT "transportes_asignados_orden_proveedor_id_fkey" FOREIGN KEY ("orden_proveedor_id") REFERENCES "ordenes_proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportes_asignados" ADD CONSTRAINT "transportes_asignados_transporte_id_fkey" FOREIGN KEY ("transporte_id") REFERENCES "transportes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_transportes_asignados" ADD CONSTRAINT "pagos_transportes_asignados_transporte_asignado_id_fkey" FOREIGN KEY ("transporte_asignado_id") REFERENCES "transportes_asignados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_orden_proveedor" ADD CONSTRAINT "pagos_orden_proveedor_orden_proveedor_id_fkey" FOREIGN KEY ("orden_proveedor_id") REFERENCES "ordenes_proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_productos" ADD CONSTRAINT "stock_productos_almacen_id_fkey" FOREIGN KEY ("almacen_id") REFERENCES "almacenes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_productos" ADD CONSTRAINT "stock_productos_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_stock" ADD CONSTRAINT "movimientos_stock_almacen_id_fkey" FOREIGN KEY ("almacen_id") REFERENCES "almacenes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_stock" ADD CONSTRAINT "movimientos_stock_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturaciones" ADD CONSTRAINT "facturaciones_id_factura_original_fkey" FOREIGN KEY ("id_factura_original") REFERENCES "facturaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturaciones" ADD CONSTRAINT "facturaciones_orden_compra_id_fkey" FOREIGN KEY ("orden_compra_id") REFERENCES "ordenes_compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gestion_cobranzas" ADD CONSTRAINT "gestion_cobranzas_orden_compra_id_fkey" FOREIGN KEY ("orden_compra_id") REFERENCES "ordenes_compra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gestion_cobranzas" ADD CONSTRAINT "gestion_cobranzas_orden_compra_privada_id_fkey" FOREIGN KEY ("orden_compra_privada_id") REFERENCES "ordenes_compra_privadas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gestion_cobranzas" ADD CONSTRAINT "gestion_cobranzas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_modificaciones_op" ADD CONSTRAINT "historial_modificaciones_op_orden_proveedor_id_fkey" FOREIGN KEY ("orden_proveedor_id") REFERENCES "ordenes_proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_modificaciones_op" ADD CONSTRAINT "historial_modificaciones_op_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programaciones_entrega" ADD CONSTRAINT "programaciones_entrega_orden_compra_id_fkey" FOREIGN KEY ("orden_compra_id") REFERENCES "ordenes_compra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programaciones_entrega" ADD CONSTRAINT "programaciones_entrega_orden_proveedor_id_fkey" FOREIGN KEY ("orden_proveedor_id") REFERENCES "ordenes_proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programaciones_entrega" ADD CONSTRAINT "programaciones_entrega_responsable_entrega_id_fkey" FOREIGN KEY ("responsable_entrega_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "costos_adicionales_op" ADD CONSTRAINT "costos_adicionales_op_orden_proveedor_id_fkey" FOREIGN KEY ("orden_proveedor_id") REFERENCES "ordenes_proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivos_adjuntos" ADD CONSTRAINT "archivos_adjuntos_orden_compra_id_fkey" FOREIGN KEY ("orden_compra_id") REFERENCES "ordenes_compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
