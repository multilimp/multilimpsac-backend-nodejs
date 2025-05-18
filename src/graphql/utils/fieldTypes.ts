// src/graphql/utils/fieldTypes.ts

/**
 * Define campos que son de tipo JSON o nativos y no relaciones
 * Esto ayuda a evitar conflictos entre select/include en Prisma
 */
export const JSON_FIELDS: Record<string, string[]> = {
  'OrdenCompra': ['productos'],
  // Añade otros modelos con campos JSON aquí
};

/**
 * Verifica si un campo es de tipo JSON para un modelo específico
 * @param entityName Nombre de la entidad/modelo
 * @param fieldName Nombre del campo
 * @returns Boolean indicando si es campo JSON
 */
export function isJsonField(entityName: string | undefined, fieldName: string): boolean {
  if (!entityName) return false;
  const jsonFields = JSON_FIELDS[entityName];
  return jsonFields ? jsonFields.includes(fieldName) : false;
}
