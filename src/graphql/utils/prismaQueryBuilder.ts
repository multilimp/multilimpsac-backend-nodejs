// src/graphql/utils/prismaQueryBuilder.ts
import { GraphQLResolveInfo } from 'graphql';
import { getFields } from './resolverUtils';
import { getEntityMappings } from './fieldMapping';
import { isJsonField } from './fieldTypes';
import logger from '../../shared/config/logger';

/**
 * Obtiene una lista plana de campos solicitados en la consulta GraphQL
 * @param info Información de la consulta GraphQL
 * @returns Lista de campos con notación de puntos para rutas anidadas
 */
export function getRequestedFields(info: GraphQLResolveInfo): string[] {
  const fields = getFields(info);
  const result: string[] = [];
  
  // Si no hay campos (posiblemente en pruebas mock), devolver array vacío
  if (!fields || typeof fields !== 'object') {
    logger.warn('No se pudieron extraer campos válidos de GraphQLResolveInfo');
    return [];
  }
  
  // Función recursiva para aplanar los campos anidados
  const processFields = (fieldsObj: any, prefix = '') => {
    Object.keys(fieldsObj).forEach(key => {
      const currentPath = prefix ? `${prefix}.${key}` : key;
      
      if (Object.keys(fieldsObj[key]).length === 0) {
        // Campo simple
        result.push(currentPath);
      } else {
        // Campo con sub-campos (relación)
        result.push(currentPath); // Añadir la relación misma
        processFields(fieldsObj[key], currentPath);
      }
    });
  };
  
  processFields(fields);
  return result;
}

/**
 * Construye un objeto de selección para Prisma basado en los campos solicitados
 * @param fields Lista de campos solicitados con notación de puntos
 * @param entityName Nombre de la entidad (opcional) para mapeos específicos
 * @returns Objeto de selección para Prisma con estructura anidada
 */
export function buildPrismaSelectObject(fields: string[], entityName?: string): any {
  // Este enfoque crea un objeto select/include anidado compatible con Prisma
  const result: any = {
    select: {}
  };
  
  // Obtener mapeos para la entidad especificada
  const relationMappings = getEntityMappings(entityName);
    fields.forEach(field => {
    // Manejar campos simples vs relaciones
    if (!field.includes('.')) {
      // Campo simple (no es relación anidada)
      if (relationMappings[field] && !isJsonField(entityName, field)) {
        // Este es un campo de relación conocido (y no es un campo JSON)
        result.include = result.include || {};
        result.include[relationMappings[field]] = true;
      } else {
        // Campo regular o campo JSON
        result.select[field] = true;
      }
    } else {
      // Campo anidado (relación)
      const parts = field.split('.');
      const topLevelField = parts[0];
      
      // Verificar si la parte superior es una relación conocida
      const relationName = relationMappings[topLevelField] || topLevelField;
      
      // Asegurar que incluimos la relación
      result.include = result.include || {};
      result.include[relationName] = result.include[relationName] || { select: {} };
      
      // Si tiene múltiples niveles de anidamiento
      if (parts.length > 2) {
        let current = result.include[relationName];
        
        // Navegar por la jerarquía de relaciones
        for (let i = 1; i < parts.length - 1; i++) {
          const part = parts[i];
          current.include = current.include || {};
          current.include[part] = current.include[part] || { select: {} };
          current = current.include[part];
        }
        
        // Añadir el campo de nivel más bajo
        const lastPart = parts[parts.length - 1];
        current.select[lastPart] = true;
      } else if (parts.length === 2) {
        // Caso simple de un nivel de anidamiento
        result.include[relationName].select[parts[1]] = true;
      }
    }
  });
  
  return result;
}

/**
 * Genera dinámicamente un objeto de selección de campos para Prisma
 * @param info Información de la consulta GraphQL
 * @param entityName Nombre de la entidad para mapeos específicos
 * @returns Objeto con configuración de select/include para Prisma
 */
export function generatePrismaSelect(info: GraphQLResolveInfo, entityName?: string): any {
  try {
    // Obtener los campos solicitados a través de GraphQL
    const requestedFields = getRequestedFields(info);
    
    // Convertir la estructura plana a un objeto anidado para Prisma
    return buildPrismaSelectObject(requestedFields, entityName);
  } catch (error) {
    logger.error(`Error generando selección de campos Prisma: ${(error as Error).message}`);
    // En caso de error, retornar objeto vacío para seleccionar solo los campos por defecto
    return {};
  }
}

/**
 * Utilidad para convertir consultas GraphQL a parámetros optimizados de Prisma
 * @param info El objeto GraphQLResolveInfo de la consulta
 * @param entityName Nombre de la entidad para mapeos específicos
 * @returns Un objeto con parámetros para consulta Prisma optimizada
 */
export function createOptimizedQueryParams(info: GraphQLResolveInfo, entityName?: string): any {
  const selection = generatePrismaSelect(info, entityName);
  
  // Si hay tanto select como include, debemos consolidar todo en un solo tipo
  // Para evitar el error "Please either use `include` or `select`, but not both at the same time."
  if (selection.select && selection.include) {
    logger.debug('Se detectaron campos y relaciones - consolidando en un solo tipo de consulta');
    
    // Decidir si usar select o include como base
    // Si hay más campos simples que relaciones, usamos select y movemos las relaciones allí
    if (Object.keys(selection.select).length >= Object.keys(selection.include).length) {
      // Usar select como base
      const consolidatedSelect = { ...selection.select };
      
      // Mover las relaciones a select
      Object.entries(selection.include).forEach(([key, value]) => {
        consolidatedSelect[key] = value;
      });
      
      return { select: consolidatedSelect };
    } else {
      // Usar include como base
      // Añadir todos los campos simples en la raíz del select
      return {
        include: selection.include,
        select: selection.select
      };
    }
  }
  
  return {
    ...selection.select && { select: selection.select },
    ...selection.include && { include: selection.include }
  };
}
