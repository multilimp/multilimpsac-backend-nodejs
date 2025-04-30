import { OrdenCompra, Prisma } from '@prisma/client';

// Tipo base omitiendo campos generados automáticamente y relaciones complejas
export type OrdenCompraBase = Omit<OrdenCompra, 'id' | 'createdAt' | 'updatedAt' | 'productos' | 'empresa' | 'cliente' | 'contactoCliente' | 'catalogoEmpresa' | 'ordenesProveedor' | 'ordenCompraPrivada' | 'facturaciones' | 'gestionCobranzas' | 'OrdenCompraAgrupada'>;

// Tipo para la creación: Hacer requeridos los campos obligatorios según tu lógica/schema
// y definir tipos correctos (Date, Decimal, JsonValue)
export type CreateOrdenCompraData = Partial<OrdenCompraBase> & {
  codigoVenta: string;
  empresaId: number;
  clienteId: number;
  contactoClienteId?: number | null; // Hacer opcional si es nullable en schema
  catalogoEmpresaId?: number | null; // Hacer opcional si es nullable en schema
  fechaEmision?: Date | string | null;
  ventaPrivada?: boolean;
  provinciaEntrega?: string | null;
  distritoEntrega?: string | null;
  departamentoEntrega?: string | null;
  direccionEntrega?: string | null;
  referenciaEntrega?: string | null;
  fechaEntrega?: Date | string | null;
  montoVenta?: number | Prisma.Decimal | null; // Usar Prisma.Decimal si es necesario
  productos?: Prisma.JsonValue | null; // Tipo correcto para JSON
  etapaActual?: string; // Considerar usar un Enum si tienes estados definidos
  // Añadir otros campos necesarios de OrdenCompraBase que sean requeridos
};

// Tipo para la actualización: Todos los campos son opcionales
export type UpdateOrdenCompraData = Partial<CreateOrdenCompraData>;
