import { Response } from 'express';
import logger from '../config/logger';
import { ZodError, ZodIssue } from 'zod';
import { Prisma } from '../../../prisma/generated/client';

const { PrismaClientKnownRequestError, PrismaClientValidationError } = Prisma;

interface HandleErrorParams {
  res: Response;
  error: any;
  statusCode?: number;
  msg?: string;
}

export const handleError = ({ res, error, statusCode = 500, msg = 'Ocurrió un error inesperado.' }: HandleErrorParams): void => {
  logger.error(msg, error);

  // Manejar errores de validación Zod con más detalles
  if (error instanceof ZodError) {
    const structuredErrors = error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message,
      code: err.code,
      // Eliminar expected y received que no existen en ZodIssue
    }));

    res.status(400).json({
      success: false,
      message: 'Error de validación.',
      errors: structuredErrors,
      rawError: process.env.NODE_ENV === 'development' ? error.errors : undefined
    });
    return;
  }
  if (error instanceof PrismaClientKnownRequestError) {
    let responseMessage = msg;
    let responseStatusCode = statusCode;
    let responseFields;
    let details;

    switch (error.code) {
      case 'P2002':
        responseStatusCode = 409;
        const target = error.meta?.target as string[] | undefined;
        const fields = target ? target.join(', ') : 'un campo';
        responseMessage = `Error de restricción de unicidad: Ya existe un registro con el mismo valor para ${fields}.`;
        responseFields = target;
        break;
      case 'P2003':
        responseStatusCode = 400;
        const fieldName = error.meta?.field_name as string | undefined;
        responseMessage = `Falló la restricción de clave foránea en el campo: ${fieldName || 'desconocido'}.`;
        details = `El valor proporcionado para '${fieldName || 'desconocido'}' no existe en la tabla referenciada o una operación relacionada viola la integridad referencial.`;
        break;
      case 'P2025':
        responseStatusCode = 404;
        responseMessage = 'Error: El registro solicitado para la operación no fue encontrado.';
        details = error.meta?.cause || 'No se encontró el registro con los criterios especificados';
        break;
      case 'P2014':
        responseStatusCode = 400;
        responseMessage = `Error de conflicto entre registros relacionados.`;
        details = error.meta?.reason || 'Conflicto en la relación entre registros';
        break;
      default:
        responseStatusCode = 400;
        responseMessage = `Error de base de datos Prisma (Código: ${error.code}).`;
        details = `Consulte la documentación de Prisma para el código ${error.code} o contacte al equipo de desarrollo.`;
        break;
    }

    // Información de depuración enriquecida para errores 400
    const debugInfo = responseStatusCode === 400 ? {
      query: error.meta?.query,
      modelName: error.meta?.modelName,
      arguments: error.meta?.arguments,
      // Eliminar la propiedad cause que no existe en PrismaClientKnownRequestError
    } : undefined;

    res.status(responseStatusCode).json({
      success: false,
      message: responseMessage,
      code: error.code,
      fields: responseFields,
      details: details,
      debug: process.env.NODE_ENV === 'development' ? debugInfo : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    return;
  }

  // Errores de validación de Prisma con formato mejorado
  if (error instanceof PrismaClientValidationError) {
    // Extraer información más útil del mensaje de error
    const errorMessage = error.message;
    const validationDetails = {
      fullMessage: errorMessage,
      invalidFields: extractInvalidFields(errorMessage),
      suggestedFix: extractSuggestions(errorMessage)
    };

    res.status(400).json({
      success: false,
      message: 'Error de validación de datos para la operación en la base de datos.',
      validationDetails: process.env.NODE_ENV === 'development' ? validationDetails : undefined,
      details: error.message.replace(/\n/g, ' ')
    });
    return;
  }

  // Errores personalizados con statusCode
  if (error.statusCode && error.message) {
    const isDebugError = error.statusCode === 400 && process.env.NODE_ENV === 'development';

    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      context: error.context || undefined,
      details: error.details || undefined,
      error: isDebugError ? serializeError(error) : undefined,
      stack: isDebugError ? error.stack : undefined
    });
    return;
  }

  // Errores genéricos mejorados para código 400
  if (statusCode === 400) {
    res.status(statusCode).json({
      success: false,
      message: msg,
      requestData: process.env.NODE_ENV === 'development' ? extractRequestData(error) : undefined,
      errorType: error.name || typeof error,
      errorMessage: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    return;
  }

  // Fallback para otros errores
  res.status(statusCode).json({
    success: false,
    message: msg,
    error: process.env.NODE_ENV === 'development' ? serializeError(error) : undefined,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
};

// Funciones auxiliares para extraer información útil de los errores

function extractInvalidFields(errorMessage: string): Record<string, string> | null {
  const fields: Record<string, string> = {};
  const argPattern = /Unknown arg `([^`]+)`/g;
  const fieldPattern = /Field `([^`]+)`/g;

  let match;
  while ((match = argPattern.exec(errorMessage)) !== null) {
    fields[match[1]] = 'Argumento desconocido';
  }

  while ((match = fieldPattern.exec(errorMessage)) !== null) {
    if (!fields[match[1]]) {
      fields[match[1]] = 'Campo con problema';
    }
  }

  return Object.keys(fields).length ? fields : null;
}

function extractSuggestions(errorMessage: string): string[] {
  const suggestions: string[] = [];
  const didYouMeanPattern = /Did you mean `([^`]+)`/g;

  let match;
  while ((match = didYouMeanPattern.exec(errorMessage)) !== null) {
    suggestions.push(`¿Quizás quiso decir "${match[1]}"?`);
  }

  return suggestions;
}

function extractRequestData(error: any): any {
  if (error.data) return error.data;
  if (error.request) return {
    url: error.request.url,
    method: error.request.method,
    params: error.request.params,
    body: error.request.body
  };
  return null;
}

function serializeError(error: any): any {
  if (!error) return null;

  const serialized: any = {};

  Object.getOwnPropertyNames(error).forEach(prop => {
    if (prop !== 'stack') {
      try {
        const value = error[prop];
        serialized[prop] = typeof value === 'object' && value !== null
          ? JSON.parse(JSON.stringify(value))
          : value;
      } catch (e) {
        serialized[prop] = '[No se puede serializar]';
      }
    }
  });

  return serialized;
}
