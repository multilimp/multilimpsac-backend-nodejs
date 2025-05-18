// src/graphql/utils/fieldMapping.ts
/**
 * Mapeo de campos GraphQL a nombres de relaciones en Prisma
 * Centraliza todas las configuraciones de mapeo de nombres
 */

/**
 * Mapeo global de nombres de relaciones entre GraphQL y Prisma
 * Cuando se añadan nuevas entidades, solo hay que actualizar este objeto
 */
export const RELATION_MAPPINGS: Record<string, string> = {
  // Mapeos de OrdenCompra
  'cliente': 'cliente',
  'empresa': 'empresa',
  'contactoCliente': 'contactoCliente',
  'ordenesProveedor': 'ordenesProveedor',
  'catalogoEmpresa': 'catalogoEmpresa',
  'facturaciones': 'facturaciones',
  'gestionCobranzas': 'gestionCobranzas',
  'OrdenCompraAgrupada': 'OrdenCompraAgrupada',
  'ordenCompraPrivada': 'ordenCompraPrivada',
  
  // Mapeos de Cliente
  'ordenesCompra': 'ordenesCompra',
  'contactos': 'contactos',
  'cotizaciones': 'cotizaciones',
  
  // Mapeos de OrdenProveedor
  'proveedor': 'proveedor',
  'productos': 'productos',
  'ordenCompra': 'ordenCompra',
  'pagos': 'pagos',
  
  // Mapeos de Proveedor
  'balances': 'balances',
  
  // Añade mapeos para nuevas entidades aquí
};

/**
 * Obtiene el mapeo específico para una entidad
 * @param entityName Nombre de la entidad (opcional)
 * @returns Objeto con mapeos para la entidad o mapeo global
 */
export function getEntityMappings(entityName?: string): Record<string, string> {
  // Podemos implementar mapeos específicos por entidad si es necesario
  switch (entityName) {
    case 'OrdenCompra':
      // Si hay mapeos específicos para OrdenCompra, podrían definirse aquí
      return RELATION_MAPPINGS;
    case 'Cliente':
      // Si hay mapeos específicos para Cliente, podrían definirse aquí
      return RELATION_MAPPINGS;
    case 'Proveedor':
      // Si hay mapeos específicos para Proveedor, podrían definirse aquí
      return RELATION_MAPPINGS;
    default:
      return RELATION_MAPPINGS;
  }
}
