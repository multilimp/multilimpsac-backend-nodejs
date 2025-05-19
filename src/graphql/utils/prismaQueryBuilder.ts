// src/graphql/utils/prismaQueryBuilder.ts
import { GraphQLResolveInfo } from 'graphql';
import { getFields } from './resolverUtils';
import { 
  getEntityMappings, 
  isJsonField, 
  isCriticalRelation,
  getCriticalFields
} from './schemaConfig';
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
      
      // Añadir el campo actual
      result.push(currentPath);
      
      // Procesar subcampos si existen
      if (Object.keys(fieldsObj[key]).length > 0) {
        processFields(fieldsObj[key], currentPath);
      }
    });
  };
  
  processFields(fields);
  return result;
}

// La función buildPrismaSelectObject ya no es necesaria, ha sido reemplazada
// por una lógica mejorada directamente en createOptimizedQueryParams

/**
 * Construye parámetros optimizados para consultas Prisma
 * @param info Información del resolver GraphQL
 * @param entityName Nombre de la entidad principal
 * @returns Un objeto con parámetros para consulta Prisma optimizada
 */
export function createOptimizedQueryParams(info: GraphQLResolveInfo, entityName?: string): any {
  try {
    // Obtener los campos solicitados a través de GraphQL
    const requestedFields = getRequestedFields(info);
    logger.debug(`Campos solicitados: ${requestedFields.join(', ')}`);
    
    // Analizar si la consulta contiene relaciones
    const hasRelations = requestedFields.some(field => field.includes('.'));
    
    // Inicializar objeto de consulta con el enfoque apropiado
    const result: any = {};
    
    // Mapa para rastrear qué relaciones ya se han incluido
    const includedRelations = new Set<string>();
    
    // Obtener mapeos para esta entidad
    const mappings = getEntityMappings(entityName);
    
    // Obtener campos críticos que siempre deben incluirse
    const criticalFields = getCriticalFields(entityName);
    
    // Añadir campos críticos a la selección
    if (criticalFields.length > 0) {
      result.select = {};
      criticalFields.forEach(field => {
        result.select[field] = true;
      });
    }
    
    // Procesar campos solicitados
    for (const field of requestedFields) {
      // Analizar si es un campo directo o parte de una relación
      const parts = field.split('.');
      
      if (parts.length === 1) {
        // Campo directo de la entidad principal
        const fieldName = parts[0];
        
        // Inicializar select si no existe
        result.select = result.select || {};
        
        // Si es una relación conocida
        if (mappings[fieldName]) {
          // Si es una relación crítica (como cliente o empresa en OrdenCompra),
          // la incluimos completa en lugar de seleccionar campos
          if (isCriticalRelation(entityName, fieldName)) {
            result.include = result.include || {};
            result.include[fieldName] = true;
            includedRelations.add(fieldName);
            
            logger.debug(`Incluyendo relación crítica completa: ${fieldName}`);
          } 
          // Para otras relaciones, las incluiremos si tienen subcampos
          else if (!includedRelations.has(fieldName)) {
            result.include = result.include || {};
            result.include[fieldName] = true;
            includedRelations.add(fieldName);
          }
        } 
        // Si es un campo normal (no relación)
        else {
          result.select[fieldName] = true;
        }
      } 
      // Campo de una relación anidada
      else {
        const relationName = parts[0];
        
        // Si aún no hemos incluido esta relación
        if (!includedRelations.has(relationName)) {
          // Si es una relación crítica, la incluimos completa
          if (isCriticalRelation(entityName, relationName)) {
            result.include = result.include || {};
            result.include[relationName] = true;
            includedRelations.add(relationName);
            
            logger.debug(`Incluyendo relación crítica anidada: ${relationName}`);
          }
          // Si no es crítica pero tiene subcampos específicos
          else {
            result.include = result.include || {};
            
            // Para simplicidad y compatibilidad con Prisma, incluimos la relación completa
            // en lugar de seleccionar campos específicos (evita problemas comunes)
            result.include[relationName] = true;
            includedRelations.add(relationName);
            
            logger.debug(`Incluyendo relación: ${relationName}`);
          }
        }
      }
    }      // Si tenemos tanto select como include, debemos consolidar en un solo tipo
    // ya que Prisma no permite usar ambos en findUnique() y otras operaciones
    if (result.select && result.include) {
      logger.debug('Se detectaron campos y relaciones - consolidando en un tipo único');
      
      // Estrategia: Convertir todo a select (más específico)
      const select = { ...result.select };
      
      // Añadir relaciones al select
      Object.keys(result.include).forEach(relationName => {
        select[relationName] = true;
      });
      
      // Devolver solo select
      return { select };
    }
    
    return result;
  } catch (error) {
    logger.error(`Error creando parámetros de consulta: ${(error as Error).message}`);
    // En caso de error, devolver un objeto vacío 
    return {};
  }
}

// Para compatibilidad con código existente
export const generatePrismaSelect = createOptimizedQueryParams;
