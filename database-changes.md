# Cambios Requeridos en la Base de Datos

## Resumen
Este documento detalla todas las modificaciones necesarias en la base de datos para cumplir con los requerimientos del sistema ERP. Los cambios están organizados por modelos y funcionalidades.

---

## 1. Modificaciones al Modelo Cliente

### Campos a Agregar:
```prisma
model Cliente {
  // ...existing fields...
  
  // Nuevos campos para dirección de entrega predeterminada
  direccionEntregaPredeterminada     String? @map("direccion_entrega_predeterminada")
  distritoEntregaPredeterminado      String? @map("distrito_entrega_predeterminado")
  provinciaEntregaPredeterminada     String? @map("provincia_entrega_predeterminada")
  departamentoEntregaPredeterminado  String? @map("departamento_entrega_predeterminado")
  
  // Mesa de partes del cliente
  usuarioMesaPartes                  String? @map("usuario_mesa_partes")
  contrasenaMesaPartes               String? @map("contrasena_mesa_partes")
  
  // ...existing code...
}
```

**Justificación:** Requerido para "Fijar una dirección de entrega por CUE" y "Usuario y contraseña de mesa de partes del cliente"

---

## 2. Modificaciones al Modelo Proveedor

### Campos a Agregar:
```prisma
model Proveedor {
  // ...existing fields...
  
  // Gestión de pagos predeterminada
  formaPagoPredeterminada           String?  @map("forma_pago_predeterminada")
  porcentajePagoPredeterminado      Decimal? @map("porcentaje_pago_predeterminado")
  estadoPagoPredeterminado          EstadoPagoOpProveedor? @map("estado_pago_predeterminado")
  
  // Cotización y estado
  capturaCotizacionUrl              String?  @map("captura_cotizacion_url")
  estadoProveedorOp                 EstadoPagoOpProveedor? @map("estado_proveedor_op")
  
  // Mesa de partes
  usuarioMesaPartes                 String?  @map("usuario_mesa_partes_proveedor")
  contrasenaMesaPartes              String?  @map("contrasena_mesa_partes_proveedor")
  
  // ...existing code...
}
```

**Justificación:** Requerido para "Actualizar forma de pago, porcentaje, estado de pago" y "Subir captura de cotización del proveedor"

---

## 3. Modificaciones al Modelo Transporte

### Campos a Agregar:
```prisma
model Transporte {
  // ...existing fields...
  
  // Mesa de partes
  usuarioMesaPartes                 String? @map("usuario_mesa_partes_transporte")
  contrasenaMesaPartes              String? @map("contrasena_mesa_partes_transporte")
  
  // ...existing code...
}
```

**Justificación:** Consistencia con otros modelos para mesa de partes

---

## 4. Modificaciones al Modelo Empresa

### Campos a Agregar:
```prisma
model Empresa {
  // ...existing fields...
  
  // Mesa de partes
  usuarioMesaPartes                 String? @map("usuario_mesa_partes_empresa")
  contrasenaMesaPartes              String? @map("contrasena_mesa_partes_empresa")
  
  // ...existing code...
}
```

**Justificación:** Consistencia para gestión de mesa de partes

---

## 5. Modificaciones al Modelo Contacto

### Campos a Agregar:
```prisma
model Contacto {
  // ...existing fields...
  
  // Datos completos del contacto
  apellido                          String? // Nombre completo
  cargo                             String? // Ya existe
  cumpleanos                        DateTime? // Ya existe
  nota                              String? // Ya existe
  usuarioDestacado                  Boolean? @map("usuario_destacado") // Ya existe
  
  // ...existing code...
}
```

**Justificación:** Requerido para "Nombre y apellido, cargo, celular, correo, cumpleaños, nota, checkbox 'Usuario Destacado'"

---

## 6. Modificaciones al Modelo OrdenCompra

### Campos a Agregar:
```prisma
model OrdenCompra {
  // ...existing fields...
  
  // Documentación y seguimiento
  documentoExtensionPlazoUrl        String?  @map("documento_extension_plazo_url")
  estadoDocumentacionOc             EstadoDocumentacionOc? @map("estado_documentacion_oc")
  notaAdicionalDocumentacionOc      String?  @map("nota_adicional_documentacion_oc")
  
  // Información del cliente
  codigoUnidadEjecutoraCliente      String?  @map("codigo_unidad_ejecutora_cliente")
  
  // Estados y flags
  entregaParcial                    Boolean? @default(false) @map("entrega_parcial")
  tuvoAmpliacionEntrega             Boolean? @default(false) @map("tuvo_ampliacion_entrega")
  fueCobrada                        Boolean? @default(false) @map("fue_cobrada")
  ventaAnulada                      Boolean? @default(false) @map("venta_anulada")
  motivoAnulacionVenta              String?  @map("motivo_anulacion_venta")
  
  // Mesa de partes
  numeroEnvioMesaPartes             String?  @map("numero_envio_mesa_partes")
  pdfEnvioMesaPartesUrl             String?  @map("pdf_envio_mesa_partes_url")
  
  // ...existing code...
}
```

**Justificación:** Requerimientos de seguimiento, facturación y cobranza

---

## 7. Modificaciones al Modelo OrdenProveedor

### Campos a Agregar:
```prisma
model OrdenProveedor {
  // ...existing fields...
  
  // Estado y anulación
  ventaAnulada                      Boolean?  @default(false) @map("venta_anulada_op")
  motivoAnulacion                   String?   @map("motivo_anulacion_op")
  
  // Documentación
  documentoEntregaCompletoUrl       String?   @map("documento_entrega_completo_url")
  etiquetadoCompletoVisualizacionUrl String?  @map("etiquetado_completo_visualizacion_url")
  
  // Estado de completado
  opCompletadoSeguimiento           Boolean?  @default(false) @map("op_completado_seguimiento")
  
  // Transporte y pagos
  guiaTransportePagoUrl             String?   @map("guia_transporte_pago_url")
  facturaTransportePagoUrl          String?   @map("factura_transporte_pago_url")
  montoPagoTransporteOp             Decimal?  @map("monto_pago_transporte_op")
  aprobacionPagoTransporteOp        Boolean?  @default(false) @map("aprobacion_pago_transporte_op")
  
  // Forma de pago específica
  formaPago                         String?   @map("forma_pago_op")
  porcentajePago                    Decimal?  @map("porcentaje_pago_op")
  estadoPagoOp                      EstadoPagoOpProveedor? @map("estado_pago_op")
  
  // Seguimiento específico
  notaGestionOp                     String?   @map("nota_gestion_op")
  estadoOp                          EstadoOpSeguimiento?   @map("estado_op_seguimiento")
  fechaEntregaReal                  DateTime? @map("fecha_entrega_real")
  retornoMercaderia                 String?   @map("retorno_mercaderia")
  cargoOea                          String?   @map("cargo_oea")
  
  // Relaciones nuevas
  historialModificaciones           HistorialModificacionesOp[]
  programacionesEntrega             ProgramacionEntrega[]
  costosAdicionales                 CostoAdicionalOp[]
  
  // ...existing code...
}
```

**Justificación:** Requerimientos de seguimiento, OP y tesorería

---

## 8. Modificaciones al Modelo TransporteAsignado

### Campos a Agregar:
```prisma
model TransporteAsignado {
  // ...existing fields...
  
  // Estado del flete
  estadoFlete                       EstadoFlete? @map("estado_flete")
  
  // Cotización y documentación
  documentoCotizacionFleteUrl       String?   @map("documento_cotizacion_flete_url")
  montoCotizacionFlete              Decimal?  @map("monto_cotizacion_flete")
  fleteCotizadoFotoUrl              String?   @map("flete_cotizado_foto_url")
  
  // Pago del transporte
  fechaPagoTransporte               DateTime? @map("fecha_pago_transporte")
  pagoCompletadoTransporte          Boolean?  @default(false) @map("pago_completado_transporte")
  
  // Guías y facturas
  guiaTransporteNumero              String?   @map("guia_transporte_numero")
  guiaTransporteUrl                 String?   @map("guia_transporte_url")
  facturaTransporteNumero           String?   @map("factura_transporte_numero")
  facturaTransporteUrl              String?   @map("factura_transporte_url")
  
  // ...existing code...
}
```

**Justificación:** Requerimientos de gestión de transporte y tesorería

---

## 9. Nuevo Modelo: HistorialModificacionesOp

```prisma
model HistorialModificacionesOp {
  id                Int      @id @default(autoincrement())
  ordenProveedorId  Int      @map("orden_proveedor_id")
  usuarioId         Int      @map("usuario_id")
  campoModificado   String   @map("campo_modificado")
  valorAnterior     String?  @map("valor_anterior")
  valorNuevo        String?  @map("valor_nuevo")
  fechaModificacion DateTime @default(now()) @map("fecha_modificacion")
  motivo            String?
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  ordenProveedor OrdenProveedor @relation(fields: [ordenProveedorId], references: [id])
  usuario        Usuario        @relation(fields: [usuarioId], references: [id])
  
  @@map("historial_modificaciones_op")
}
```

**Justificación:** Requerido para "Registro de historial de modificaciones (Rol OP)"

---

## 10. Nuevo Modelo: ProgramacionEntrega

```prisma
model ProgramacionEntrega {
  id                      Int      @id @default(autoincrement())
  ordenProveedorId        Int?     @map("orden_proveedor_id")
  ordenCompraId           Int?     @map("orden_compra_id")
  tipoProgramacion        TipoProgramacionOp @map("tipo_programacion")
  estadoProgramacion      EstadoProgramacionOp @map("estado_programacion")
  responsableEntregaId    Int?     @map("responsable_entrega_id")
  fechaMaximaEntrega      DateTime? @map("fecha_maxima_entrega")
  monto                   Decimal?
  ordenElectronica        String?  @map("orden_electronica_prog")
  ordenFisica             String?  @map("orden_fisica_prog")
  departamentoEntrega     String?  @map("departamento_entrega_prog")
  provinciaEntrega        String?  @map("provincia_entrega_prog")
  distritoEntrega         String?  @map("distrito_entrega_prog")
  documentosAdjuntos      String[] @map("documentos_adjuntos_prog")
  nota                    String?  @map("nota_prog")
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  ordenProveedor     OrdenProveedor? @relation(fields: [ordenProveedorId], references: [id])
  ordenCompra        OrdenCompra?    @relation(fields: [ordenCompraId], references: [id])
  responsableEntrega Usuario?        @relation("ResponsableProgramacion", fields: [responsableEntregaId], references: [id])
  
  @@map("programaciones_entrega")
}
```

**Justificación:** Requerido para gestión de programación de entregas del rol Seguimiento

---

## 11. Nuevo Modelo: CostoAdicionalOp

```prisma
model CostoAdicionalOp {
  id                Int      @id @default(autoincrement())
  ordenProveedorId  Int      @map("orden_proveedor_id")
  concepto          String
  descripcion       String?
  comprobanteUrl    String?  @map("comprobante_url")
  monto             Decimal
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  ordenProveedor OrdenProveedor @relation(fields: [ordenProveedorId], references: [id])
  
  @@map("costos_adicionales_op")
}
```

**Justificación:** Requerido para "Añadir campos de costo adicional: concepto, descripción, comprobante, monto"

---

## 12. Modificaciones al Modelo GestionCobranza

### Estructura Completa Actualizada:
```prisma
model GestionCobranza {
  id                           Int       @id @default(autoincrement())
  ordenCompraId                Int?      @map("orden_compra_id")
  ordenCompraPrivadaId         Int?      @map("orden_compra_privada_id")
  usuarioId                    Int       @map("usuario_id")
  fechaGestion                 DateTime  @map("fecha_gestion")
  notaGestion                  String?   @map("nota_gestion")
  estadoCobranza               String?   @map("estado_cobranza")
  
  // Campos específicos de cobranza
  tipoCobranza                 TipoCobranza? @map("tipo_cobranza")
  voucherPagoUrl               String?    @map("voucher_pago_url")
  pagoConformeTesoreria        Boolean?   @default(false) @map("pago_conforme_tesoreria")
  cartaAmpliacionUrl           String?    @map("carta_ampliacion_url")
  capturaEnvioDocumentoUrl     String?    @map("captura_envio_documento_url")
  archivosAdjuntosNotasGestion String[]   @map("archivos_adjuntos_notas_gestion")
  documentosRegistrados        String[]   @map("documentos_registrados")
  notaEspecialEntrega          String?    @map("nota_especial_entrega")
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  ordenCompra        OrdenCompra?        @relation(fields: [ordenCompraId], references: [id])
  ordenCompraPrivada OrdenCompraPrivada? @relation(fields: [ordenCompraPrivadaId], references: [id])
  usuario            Usuario             @relation(fields: [usuarioId], references: [id])
  
  @@map("gestion_cobranzas")
}
```

**Justificación:** Requerimientos de cobranza y gestión de documentos

---

## 13. Nuevo Modelo: Usuario (Actualizado)

```prisma
model Usuario {
  id        Int      @id @default(autoincrement())
  nombre    String
  apellido  String?  // Para nombre completo
  email     String   @unique
  password  String   // Considerar encriptación
  rol       Role     @default(USER)
  estado    Boolean  @default(true)
  foto      String?
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  // Relaciones
  gestionesCobranza           GestionCobranza[]
  historialModificaciones     HistorialModificacionesOp[]
  programacionesResponsable   ProgramacionEntrega[] @relation("ResponsableProgramacion")
  
  @@map("usuarios")
}
```

**Justificación:** Modelo base para autenticación y auditoría

---

## 14. Nuevos Enums

```prisma
// Estados de programación
enum EstadoProgramacionOp {
  PENDIENTE
  COMPLETADO
  CANCELADO
  PROCESANDO
}

// Tipos de programación
enum TipoProgramacionOp {
  PROGRAMADO
  REPROGRAMADO
  PROGRAMADO_ENTREGADO
  REPROGRAMADO_ENTREGADO
}

// Estados de flete
enum EstadoFlete {
  PAGO_URGENTE
  PAGAR
  COTIZANDO
}

// Estados de pago OP Proveedor
enum EstadoPagoOpProveedor {
  URGENTE_PAGO
  PENDIENTE_PAGO
  PAGAR_PROVEEDOR
  COTIZANDO_PAGO
  PAGADO_PARCIAL
  PAGADO_TOTAL
}

// Estados de OP Seguimiento
enum EstadoOpSeguimiento {
  PENDIENTE
  EN_PROCESO
  COMPLETADO
  RETRASADO
  CANCELADO
}

// Estados de documentación OC
enum EstadoDocumentacionOc {
  CON_GUIA
  CON_FACTURA
  SIN_DOCUMENTO
}

// Tipos de cobranza
enum TipoCobranza {
  ESPECIAL
  NORMAL
}
```

**Justificación:** Normalización de estados según requerimientos

---

## 15. Índices y Optimizaciones Sugeridas

```sql
-- Índices para mejorar rendimiento en consultas frecuentes
CREATE INDEX idx_orden_compra_fecha_entrega ON ordenes_compra(fecha_entrega);
CREATE INDEX idx_orden_compra_estado_cobranza ON ordenes_compra(estado_cobranza);
CREATE INDEX idx_orden_proveedor_estado_op ON ordenes_proveedor(estado_op_seguimiento);
CREATE INDEX idx_programacion_entrega_fecha ON programaciones_entrega(fecha_maxima_entrega);
CREATE INDEX idx_gestion_cobranza_fecha ON gestion_cobranzas(fecha_gestion);
```

---

## 16. Migraciones Recomendadas

### Orden de Ejecución:
1. **Migración 1:** Agregar nuevos enums
2. **Migración 2:** Modificar modelos existentes (Cliente, Proveedor, Transporte, Empresa)
3. **Migración 3:** Modificar OrdenCompra y OrdenProveedor
4. **Migración 4:** Crear nuevos modelos (HistorialModificacionesOp, ProgramacionEntrega, CostoAdicionalOp)
5. **Migración 5:** Actualizar modelo GestionCobranza
6. **Migración 6:** Agregar índices y optimizaciones

### Comandos de Migración:
```bash
# Generar migración
npx prisma migrate dev --name "add_erp_requirements_phase_1"

# Aplicar migración
npx prisma migrate deploy

# Generar cliente actualizado
npx prisma generate
```

---

## 17. Validaciones y Constraints

```prisma
// Ejemplo de validaciones a considerar
model OrdenCompra {
  // Constraint: Una orden no puede tener fecha de entrega anterior a fecha de emisión
  // Validation: montoVenta debe ser positivo
  // Constraint: ventaAnulada y estadoActivo son mutuamente excluyentes
}

model ProgramacionEntrega {
  // Constraint: Debe tener al menos ordenProveedorId o ordenCompraId
  // Validation: fechaMaximaEntrega no puede ser anterior a hoy
}
```

---

## 18. Campos Calculados y Vistas Sugeridas

```sql
-- Vista para OC pendientes de cobro
CREATE VIEW oc_pendientes_cobro AS
SELECT * FROM ordenes_compra 
WHERE fue_cobrada = false AND estado_activo = true;

-- Vista para OC cobradas
CREATE VIEW oc_cobradas AS
SELECT * FROM ordenes_compra 
WHERE fue_cobrada = true;

-- Vista para alertas de entrega por departamento
CREATE VIEW alertas_entrega AS
SELECT 
  id,
  codigo_venta,
  departamento_entrega,
  fecha_entrega,
  CASE 
    WHEN fecha_entrega < CURRENT_DATE THEN 'VENCIDA'
    WHEN fecha_entrega <= CURRENT_DATE + INTERVAL '3 days' THEN 'URGENTE'
    WHEN fecha_entrega <= CURRENT_DATE + INTERVAL '7 days' THEN 'PROXIMA'
    ELSE 'NORMAL'
  END as estado_alerta
FROM ordenes_compra
WHERE estado_activo = true AND fecha_entrega IS NOT NULL;
```

---

## Resumen de Cambios

### Modelos Modificados: 7
- Cliente, Proveedor, Transporte, Empresa, Contacto, OrdenCompra, OrdenProveedor

### Modelos Nuevos: 4
- HistorialModificacionesOp, ProgramacionEntrega, CostoAdicionalOp, Usuario (actualizado)

### Enums Nuevos: 6
- EstadoProgramacionOp, TipoProgramacionOp, EstadoFlete, EstadoPagoOpProveedor, EstadoOpSeguimiento, EstadoDocumentacionOc, TipoCobranza

### Campos Totales Agregados: ~45

Estos cambios cubrirán todos los requerimientos especificados para los roles de Seguimiento, Tesorería, OP, Cobranza, Facturación y Entrega.
