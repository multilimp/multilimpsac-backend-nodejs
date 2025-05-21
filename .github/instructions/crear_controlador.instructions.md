---
applyTo: '**/*.ts'
---
Coding standards, domain knowledge, and preferences that AI should follow.

## Crear controlador para Ordenes de Proveedor (OP)

- El controlador debe implementar las operaciones CRUD básicas para el modelo OrdenProveedor.
- El campo codigoOp debe ser autogenerado por una función dedicada (no se debe aceptar un valor proporcionado por el usuario).
- No incluir datos de ejemplo ni datos generados en el código.
- Seguir la estructura y convenciones del proyecto (FSD, TypeScript idiomático, sin comentarios en el código generado).
- Utilizar Prisma para las operaciones de base de datos.
- Manejar errores usando la utilidad handleError de shared/utils/handleError.ts si está disponible.
- El controlador debe estar ubicado en la capa features, slice ordenProveedor, archivo ordenProveedor.controller.ts.
- El servicio asociado debe estar en ordenProveedor.service.ts y la ruta en ordenProveedor.routes.ts.
- Si se requiere validación, usar Zod y ubicar el schema en ordenProveedor.validation.ts.
- No incluir lógica de generación de datos de prueba ni mocks.
- El controlador debe exponer funciones para: crear, listar, obtener por id, actualizar y eliminar (borrado lógico usando el campo activo).
- La función de generación de codigoOp debe estar en el servicio y ser utilizada al crear una OP.

POST /orden_compra/:idOrdenCompra/op --> Crear OP, insertar en la base de datos
{
  "proveedorId": 1,
  "contactoProveedorId": 9,

  // fechas
  "fechaDespacho": "2025-05-20T00:00:00.000Z", 
  "fechaProgramada": "2025-05-22T00:00:00.000Z",
  "fechaRecepcion": "2025-05-25T00:00:00.000Z",

  //productos
  "notaPedido": "NP-2025-001",
  "totalProveedor": "4000",

  "activo": true,
  "estadoOp": "pendiente",

  //pagos
  "tipoPago": "Pago Urgente",
  "notaPago": "Nota de pago urgente",

  "productos": {
    "create": [
      {
        "codigo": "op1",
        "descripcion": "op producto 1 test",
        "unidadMedida": "UND",
        "cantidad": 100,
        "cantidadAlmacen": 0,
        "cantidadTotal": 100,
        "precioUnitario": "20",
        "total": "2000"
      },
      {
        "codigo": "op1",
        "descripcion": "op producto 1 test",
        "unidadMedida": "UND",
        "cantidad": 100,
        "cantidadAlmacen": 0,
        "cantidadTotal": 100,
        "precioUnitario": "20",
        "total": "2000"
      }
    ]
  },
  "transportesAsignados": {
    "create": [
      {
        "transporteId": 5,
        "contactoTransporteId": 9,
        "destino": "Almacén Principal Ciudad Capital",
        "region": "Región Central",
        "provincia": "Provincia Capital",
        "distrito": "Distrito Central",
        "direccion": "Av. Los Industriales 123, Zona Industrial",
        "notaTransporte": "Entrega en horario de oficina. Preguntar por Sr. Almacenero.",
        "cotizacionTransporte": "COT-TRANS-789.pdf"
      },
      {
        "transporteId": 5,
        "contactoTransporteId": 9,
        "destino": "Almacén Principal Ciudad Capital",
        "region": "Región Central",
        "provincia": "Provincia Capital",
        "distrito": "Distrito Central",
        "direccion": "Av. Los Industriales 123, Zona Industrial",
        "notaTransporte": "Entrega en horario de oficina. Preguntar por Sr. Almacenero.",
        "cotizacionTransporte": "COT-TRANS-789.pdf"
      }
    ]
  }
}
