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
  
  // Asegurarnos de incluir campos críticos para entidades específicas
  if (entityName === 'OrdenCompra') {
    // Siempre incluir campos críticos para OrdenCompra
    result.select.id = true;
    result.select.clienteId = true;
    result.select.empresaId = true;
  }
  
  fields.forEach(field => {
    // Manejar campos simples vs relaciones
    if (!field.includes('.')) {
      // Campo simple (no es relación anidada)
      if (relationMappings[field] && !isJsonField(entityName, field)) {
        // Este es un campo de relación conocido (y no es un campo JSON)
        result.include = result.include || {};
        
        // Si es cliente o empresa en OrdenCompra, manejo especial
        if (entityName === 'OrdenCompra' && (field === 'cliente' || field === 'empresa')) {
          // Usar true para indicar que queremos toda la relación
          result.include[relationMappings[field]] = true;
          
          // Registrar que estamos haciendo un tratamiento especial para estas relaciones
          logger.debug(`Detectada relación importante para OrdenCompra: ${field}`);
        } else {
          // Para otras relaciones, comportamiento normal
          result.include[relationMappings[field]] = true;
        }
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
      
      // Si es una relación crítica como cliente o empresa, usar true directamente
      if (entityName === 'OrdenCompra' && (topLevelField === 'cliente' || topLevelField === 'empresa')) {
        result.include[relationName] = true;
        logger.debug(`Usando include completo para relación crítica: ${topLevelField}`);
      } else {
        // Para otras relaciones, usar select anidado
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
  
  // Log para diagnóstico
  logger.debug(`Selección generada para ${entityName || 'entidad desconocida'}: 
    Select: ${JSON.stringify(selection.select || {})}
    Include: ${JSON.stringify(selection.include || {})}`);
    
  // Si hay tanto select como include, debemos consolidar todo en un solo tipo
  // Para evitar el error "Please either use `include` or `select`, but not both at the same time."
  if (selection.select && selection.include) {
    logger.debug('Se detectaron campos y relaciones - consolidando en un solo tipo de consulta');
    
    // Mejorado: Combinar los campos del select dentro del include para asegurar que se carguen todos
    const include = { ...selection.include };
    
    // Incluir los campos básicos necesarios
    include._count = true; // Asegura que los contadores estén disponibles
    
    // Asegurar que los IDs de relación estén incluidos
    if (entityName === 'OrdenCompra') {
      include.id = true;
      include.clienteId = true;
      include.empresaId = true;
      // Incluir cualquier otro campo básico importante
      Object.keys(selection.select || {}).forEach(field => {
        include[field] = true;
      });
    } else {
      // Para otras entidades, simplemente usar el include
      Object.keys(selection.select || {}).forEach(field => {
        include[field] = true;
      });
    }
    
    logger.debug(`Include optimizado: ${JSON.stringify(include)}`);
    return { include };
  }
  
  return {
    ...selection.select && { select: selection.select },
    ...selection.include && { include: selection.include }
  };
}
