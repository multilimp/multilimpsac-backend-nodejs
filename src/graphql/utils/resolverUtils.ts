// src/graphql/utils/resolverUtils.ts
import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';
import logger from '../../shared/config/logger';
import { Prisma } from '@prisma/client';
import { createOptimizedQueryParams } from './prismaQueryBuilder';
import { manejarErrorGraphQL } from './errorHandling';

/**
 * Extrae los campos solicitados de una consulta GraphQL
 * @param info Objeto GraphQLResolveInfo de la consulta
 * @returns Objeto con estructura de campos solicitados
 */
export function getFields(info: GraphQLResolveInfo): any {
  try {
    // Usar graphqlFields para extraer la estructura de campos solicitados
    return graphqlFields(info);
  } catch (error) {
    logger.error(`Error extrayendo campos de GraphQL: ${(error as Error).message}`);
    // En caso de error, devolvemos un objeto vacío
    return {};
  }
}

/**
 * Función auxiliar para deserializar una consulta GraphQL
 * y obtener los campos que se están pidiendo.
 * @param info Información de la consulta GraphQL
 * @returns Objeto con los campos solicitados
 */
export function parseGraphQLQuery(info: GraphQLResolveInfo): any {
  try {
    const fields = getFields(info);
    return fields;
  } catch (error) {
    logger.error(`Error parseando consulta GraphQL: ${(error as Error).message}`);
    return {};
  }
}

/**
 * Utilidad para optimizar consultas de Prisma basadas en selecciones GraphQL
 * Esta es una función envolvente que utiliza prismaQueryBuilder para crear consultas optimizadas
 * @param info Información del resolver GraphQL
 * @param entityName Nombre de la entidad principal
 * @returns Objeto de consulta optimizado para Prisma con select/include
 */
export function optimizarConsultaPrisma(info: GraphQLResolveInfo, entityName?: string): any {
  return createOptimizedQueryParams(info, entityName);
}

/**
 * Procesa errores en operaciones GraphQL usando el manejador centralizado
 * @param error Error capturado
 * @param operacionNombre Nombre descriptivo de la operación
 * @returns Error formateado para GraphQL
 */
export function procesarError(error: any, operacionNombre: string): Error {
  return manejarErrorGraphQL(error, operacionNombre);
}

/**
 * Construye un objeto de inclusión simple para consultas de Prisma con selección mínima
 * Útil para operaciones donde no se necesita optimización completa
 * @param relaciones Lista de relaciones a incluir
 * @returns Objeto include para Prisma
 */
export function construirIncludeSimple(relaciones: string[]): Record<string, boolean> {
  const include: Record<string, boolean> = {};
  
  relaciones.forEach(relacion => {
    include[relacion] = true;
  });
  
  return include;
}
