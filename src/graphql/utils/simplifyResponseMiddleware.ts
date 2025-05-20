/**
 * Middleware para simplificar las respuestas GraphQL
 * Elimina la estructura anidada estándar { data: { campo: valor } }
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../../shared/config/logger';

export const simplifyResponseMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Guardamos el método original send de la respuesta
  const originalSend = res.send;

  // Sobreescribimos el método send para interceptar la respuesta
  res.send = function(body) {
    try {
      // Verificar que el body es un string (respuesta JSON)
      if (typeof body === 'string') {
        // Intentar parsear como JSON
        const parsedBody = JSON.parse(body);

        // Si tiene datos y no tiene errores, simplificar
        if (parsedBody.data && !parsedBody.errors) {
          // Extraer el nombre de la primera operación (query o mutation)
          const operationNames = Object.keys(parsedBody.data);
          
          if (operationNames.length === 1) {
            // Caso simple: una sola operación, reemplazamos con sus datos
            const firstOperation = operationNames[0];
            logger.debug(`Simplificando respuesta GraphQL para operación: ${firstOperation}`);
            
            // Devolver solo el resultado de la operación
            return originalSend.call(this, JSON.stringify(parsedBody.data[firstOperation]));
          } else if (operationNames.length > 1) {
            // Caso múltiple: varias operaciones, mantener estructura pero sin "data"
            logger.debug(`Simplificando respuesta GraphQL para múltiples operaciones: ${operationNames.join(', ')}`);
            
            // Devolver todos los resultados sin el nivel "data"
            return originalSend.call(this, JSON.stringify(parsedBody.data));
          }
        }
        
        // Si hay errores o la estructura no es la esperada, devolver la respuesta original
        if (parsedBody.errors) {
          logger.debug('Respuesta GraphQL contiene errores, no se simplifica');
        }
      }
      
      // Si no se puede procesar, devolver la respuesta original sin modificar
      return originalSend.call(this, body);
    } catch (error) {
      // Si hay cualquier error al procesar, log y devolver la respuesta original
      logger.error(`Error al intentar simplificar respuesta GraphQL: ${(error as Error).message}`);
      return originalSend.call(this, body);
    }
  };
  
  // Continuar con la cadena de middleware
  next();
};
