// src/graphql/utils/schemaConfig.ts
/**
 * Configuración centralizada de esquemas GraphQL y mapeos con Prisma
 * Este archivo consolida la funcionalidad de fieldMapping.ts y fieldTypes.ts
 */

/**
 * Mapeo global de nombres de relaciones entre GraphQL y Prisma
 * Centraliza todas las configuraciones de mapeo de nombres
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
 * Define los tipos para las configuraciones de campos
 */
interface FieldMappings {
  [entityName: string]: string[];
}

/**
 * Define campos que son de tipo JSON y no relaciones
 */
export const FIELD_TYPES = {
  // Campos JSON por entidad
  JSON_FIELDS: {
    'OrdenCompra': ['productos'],
    // Añade otros modelos con campos JSON aquí
  } as FieldMappings,
  
  // Campos de fecha por entidad (para posible procesamiento especial)
  DATE_FIELDS: {
    'OrdenCompra': ['fechaEmision', 'fechaEntrega', 'fechaSiaf']
  } as FieldMappings,
  
  // Campos críticos que siempre deben incluirse en las consultas
  CRITICAL_FIELDS: {
    'OrdenCompra': ['id', 'clienteId', 'empresaId'],
    'Cliente': ['id', 'razonSocial'],
    'Empresa': ['id', 'razonSocial']
  } as FieldMappings,
  
  // Relaciones críticas que siempre deben cargarse completas
  CRITICAL_RELATIONS: {
    'OrdenCompra': ['cliente', 'empresa']
  } as FieldMappings
};

/**
 * Verifica si un campo es de tipo JSON para un modelo específico
 * @param entityName Nombre de la entidad/modelo
 * @param fieldName Nombre del campo
 * @returns Boolean indicando si es campo JSON
 */
export function isJsonField(entityName: string | undefined, fieldName: string): boolean {
  if (!entityName) return false;
  const jsonFields = FIELD_TYPES.JSON_FIELDS[entityName as keyof typeof FIELD_TYPES.JSON_FIELDS];
  return Array.isArray(jsonFields) ? jsonFields.includes(fieldName) : false;
}

/**
 * Verifica si un campo es una relación crítica que debe cargarse completa
 * @param entityName Nombre de la entidad/modelo
 * @param fieldName Nombre del campo
 * @returns Boolean indicando si es una relación crítica
 */
export function isCriticalRelation(entityName: string | undefined, fieldName: string): boolean {
  if (!entityName) return false;
  const criticalRelations = FIELD_TYPES.CRITICAL_RELATIONS[entityName as keyof typeof FIELD_TYPES.CRITICAL_RELATIONS];
  return Array.isArray(criticalRelations) ? criticalRelations.includes(fieldName) : false;
}

/**
 * Obtiene los campos críticos para una entidad
 * @param entityName Nombre de la entidad/modelo
 * @returns Array de nombres de campos críticos
 */
export function getCriticalFields(entityName: string | undefined): string[] {
  if (!entityName) return [];
  const fields = FIELD_TYPES.CRITICAL_FIELDS[entityName as keyof typeof FIELD_TYPES.CRITICAL_FIELDS];
  return Array.isArray(fields) ? fields : [];
}

/**
 * Obtiene el mapeo específico para una entidad
 * @param entityName Nombre opcional de la entidad
 * @returns Objeto con mapeos de nombres de campos
 */
export function getEntityMappings(entityName?: string): Record<string, string> {
  // Por ahora solo usamos el mapeo global, pero podría extenderse
  // para tener mapeos específicos por entidad
  return RELATION_MAPPINGS;
}
