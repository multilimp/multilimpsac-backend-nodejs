// src/graphql/utils/errorHandling.ts
import logger from '../../shared/config/logger';

/**
 * Constantes para códigos de error de GraphQL
 */
export const ERROR_CODES = {
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  BAD_REQUEST: 'BAD_REQUEST',
  INTERNAL: 'INTERNAL_SERVER_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  DATABASE: 'DATABASE_ERROR',
};

/**
 * Maneja errores comunes de GraphQL y los formatea adecuadamente
 * @param error Error original
 * @param operacion Nombre de la operación donde ocurrió el error
 * @returns Error formateado para GraphQL
 */
export function manejarErrorGraphQL(error: any, operacion: string): Error {
  logger.error(`Error en operación GraphQL ${operacion}:`, error);
  
  // Identificar tipo de error y dar respuesta apropiada
  if (error.code === 'P2025') {
    return new Error(`Recurso no encontrado: ${error.meta?.cause || 'El registro solicitado no existe'}`);
  } else if (error.code?.startsWith('P2')) {
    return new Error(`Error en consulta de base de datos: ${error.message}`);
  } else if (error.message?.includes('No autenticado') || error.message?.includes('Unauthorized')) {
    // Errores de autenticación
    return new Error(`Acceso no autorizado: debe iniciar sesión para realizar esta operación`);
  } else if (error.name === 'ValidationError') {
    // Errores de validación
    return new Error(`Error de validación: ${error.message}`);
  }
  
  // Error genérico
  return new Error(`Error en operación ${operacion}: ${error.message || 'Error desconocido'}`);
}

/**
 * Formatea un error para la respuesta GraphQL con código y detalles adicionales
 * Útil para integración con clientes que procesan errores estructurados
 * @param error Error original o mensaje
 * @param code Código de error (de ERROR_CODES)
 * @param details Detalles adicionales (opcional)
 */
export function formatGraphQLError(error: Error | string, code: string, details?: any): Error {
  const message = typeof error === 'string' ? error : error.message;
  const formattedError = new Error(message);
  
  // Añadir extensiones al error para Apollo Server
  (formattedError as any).extensions = {
    code,
    details,
    timestamp: new Date().toISOString()
  };
  
  return formattedError;
}
