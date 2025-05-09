# Requerimientos del Sistema ERP

> 💡 Desarrollar ERP, con automatización de IA y API

## Integración con APIs en Power BI (Nuevo)

- [ ] ~~API de Perú Compras para consumir datos y visualizarlos en Power BI~~
- [ ] ~~API de Sistema Multilimpsac ERP v2.0 para extraer y procesar datos en Power BI~~
- [ ] ~~Estructuración de Base de Datos según Perú Compras~~
- [ ] ~~Vincular los datos de OC utilizando el Nº de Orden Electrónica y ubigeo~~

## Integración con APIs en MULTILIMP ERP v2.0 (Nuevo)

- [ ] ~~Integración del API de Perú Compras~~
- [ ] ~~Seguimiento de ventas tercerizadas registradas en Perú Compras (API)~~

## Mejoras de Usabilidad (Nuevo)

🔗 [Utilidad y Productividad Nuevo](https://www.notion.so/Utilidad-y-Productividad-Nuevo-176909cf90a5801c92c2dc371ab86b3d?pvs=21)

- [ ] ~~Tarjetas de resumen básica 1 por rol (filtro)~~
- [ ] ~~Filtrar por columna de datos (Rayo)~~
- [ ] ~~Fijar filas de las tablas en la parte superior de la tabla como destacado~~
- [x] Separar las tablas OC (cobradas / pendientes de cobro)
- [ ] ~~Sistema de Chat~~

## Funciones por Rol

### Rol Cotización

- [ ] ~~Página de precio y generador PDF de lista de precios~~

## Rol Ventas

- [ ] Registro e inventario de productos (propio y proveedores)
- [ ] Filtro por categoría, fecha, buscador (precio mínimo, promedio, máximo)
- [ ] Resultados de enlaces a la OP

## Rol Contabilidad

- [ ] Gestión stock de almacén (por contabilidad y seguimiento)
- [ ] Visualizar stock de almacén (OP)

## Rol OP

- [x] ~~Precios unitarios de compra a proveedor (pestaña de registrar manual)~~
- [ ] Agregar múltiples transportes (OP)
- [ ] Posibilidad de anular una venta, pero que quede en el sistema opcional
- [ ] Registro de historial de modificaciones (Rol OP)

## Rol Seguimiento

**Tipo de Programación:**

- Programado
- Reprogramado
- Programado Entregado
- Reprogramado Entregado

- [ ] Enlace de la programación a la OP correspondiente en una página nueva
- [ ] Editar estado de programación por OP (Completado / Pendiente / Cancelado / Procesando)
- [ ] Visualizar factura cliente / guía remisión cliente / otros
- [ ] Marca opción entrega completado
- [ ] Asignar responsable de entrega (Logístico)
- [ ] Informe de entregas
- [ ] Subir cargo recibido, transporte o entidad (gestor logístico)

### Almacén

- [ ] Registrar ingreso de producto a almacén (pestaña de registrar manual)

**Versión móvil de programación de entrega (Seguimiento):**

- [ ] ID Venta
- [ ] Cliente / Razón Social
- [ ] Fecha máxima de entrega
- [ ] Monto
- [ ] Orden Electrónica / Orden Física
- [ ] Departamento
- [ ] Factura / Guía de Remisión / Otros documentos
- [ ] Estado de entrega

## Rol Tesorería

**Transporte:**

- [ ] Agregar pagos de transporte
- [ ] Visualizar estado del flete (Pago urgente / Pagar / Cotizando)
- [ ] Ver doc. cotización de flete (factura, guía, nota) + monto
- [ ] Colocar fecha de pago
- [ ] Marca opción pago completado

## Rol Cobranza

**Tipo de Cobranza:**

- [ ] Cobranza Especial
  - [ ] Reiniciar el contador de cobranza si se agrega una OP
  - [ ] Media de tiempo de pago por entidad
- [ ] Cobranza Normal

## Datos Clientes

- [ ] Fijar una dirección de entrega por CUE (Departamento / Provincia / Distrito)

## Rol de Venta

### Cotización > Venta Tercerizada

- [ ] Seleccionar datos de facturación (Proveedor al Estado)
- [ ] Gestión Cobranza:
  - [ ] Subir voucher de pago
  - [ ] Visualizar conformidad de pago (Tesorería)

### Cotización > Venta Privada

- [ ] Cobranza rol de venta
- [ ] Gestión Cobranza:
  - [ ] Visualizar conformidad de pago (Tesorería)

## IA PDF

### Crear OC mediante Orden Electrónica

- Asignar código de unidad ejecutora
- Campos editables
- Visualizar dirección de entrega registrada (cliente)

## Rol de OP

**Proveedor:**

- [ ] Actualizar forma de pago, porcentaje, estado de pago
- [ ] Subir captura de cotización del proveedor
- [ ] Seleccionar estado (Urgente / Pagar / Cotizando)
- [ ] Visualizar estado de pago (Tesorería):
  - [ ] Porcentaje pagado
  - [ ] Fecha de pago
  - [ ] Captura de pago
  - [ ] Nota de pago

- [x] ~~Resumen del trámite de OP en columnas~~
  - Pedido enviado
  - Pago enviado
  - Fecha de recepción registrada
  - Fecha de despacho (seguimiento)

**PDF OP:**

- [ ] Cambiar formato de órdenes de OP
- [x] Instrucciones de etiquetado + contacto visible si aplica
- [x] Añadir condiciones al pie del documento

**Transporte:**

- [ ] Flete cotizado / Foto visible para Tesorería y Seguimiento
- [ ] Sumar el flete mientras el pagado no esté disponible
- [ ] Proceso completado por OP
- [ ] Proceso completado por Transporte

## Rol de Seguimiento

**OP:**

- [ ] Añadir campos de costo adicional: concepto, descripción, comprobante, monto
- [ ] Visualizar guía remisión cliente (desde Facturación)
- [ ] Subir documento de entrega completo
- [ ] Visualizar etiquetado completo
- [ ] Marca opción OP Completado
- [ ] Subir guía o factura de transporte para pago
- [ ] Colocar monto de pago de transporte
- [ ] Opción de aprobar pago transporte

**Columna OC:**

- [ ] Fuera de plazo / Dentro de plazo
- [ ] Subir documento de extensión de plazo
- [x] Columna de alertas según días restantes de entrega por departamento
- [ ] Con guía / Con factura / Sin documento (nota adicional)

**Proveedor:**

- [ ] Ver captura y fecha de pago
- [ ] Ver porcentaje pagado

**Transporte:**

- [ ] Subir guía y número
- [ ] Estado del pago (Urgente / Pagar / Cotizando)
- [ ] Subir factura y número
  - [ ] Visualizar estado de pago (Tesorería)
- [ ] Ver monto, fecha y comprobante de pago
- [ ] Marca opción transporte completado
- [ ] Resumen de entregas mensuales con factura

## Rol de Entrega

- [ ] Versión móvil de programación
- [ ] Asignar encargado logístico
- [ ] Reporte diario por logístico
- [ ] Calendario de programación
- [ ] Botón "Envío Completado OP"
- [ ] Botón de imprimir documentos

## Rol de Facturación

- [ ] Ver si la entrega es parcial o completa
- [ ] Ver si hubo ampliación de entrega
- [ ] Ver si la OC fue cobrada
- [ ] Ver lista de programación tipo calendario
- [ ] Subir guía y factura del cliente
- [ ] Añadir motivo y historial de refacción
- [ ] Ver si la venta fue anulada
- [ ] Número y PDF de envío por mesa de partes
- [ ] Tarjetas de OC entregadas en mes / facturadas en mes siguiente

## Rol de Tesorería (Proveedor)

- [ ] Ver estado de pago (Urgente / Pagar / Cotizando)
- [ ] Ver cotización del proveedor + monto
- [ ] Ver forma de pago (crédito, parcial, total)
- [ ] Factura, captura y fecha de pago
- [ ] Marca opción pago completado

## Rol de Cobranza

- [ ] Mostrar carta de ampliación
- [ ] Usuario y contraseña de mesa de partes del cliente
- [ ] Captura de envío de documento + PDF
- [ ] Subir múltiples archivos a notas de gestión
- [ ] Registro de documentos
- [ ] Nota especial de entrega
- [ ] Departamento y provincia del cliente

## Optimización

- [ ] Tabla de OC pendientes de cobro
- [ ] Tabla de OC cobradas

## Datos de Contacto

(Usuario / Empresa / Cliente / Proveedor / Transporte)

- [ ] Nombre y apellido
- [ ] Cargo
- [ ] Celular
- [ ] Correo
- [ ] Cumpleaños
- [ ] Nota
- [ ] Checkbox “Usuario Destacado”

## Datos Generales

(Empresa / Clientes / Proveedor / Transporte)

- [ ] Usuario y contraseña de mesa de parte
- [x] 2 cuentas de banco
- [x] 2 CCI
