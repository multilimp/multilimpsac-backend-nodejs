import { Response } from 'express';
import logger from '../config/logger'; // Ajusta la ruta a tu logger
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

interface HandleErrorParams {
  res: Response;
  error: any;
  statusCode?: number;
  msg?: string;
}

export const handleError = ({ res, error, statusCode = 500, msg = 'Ocurrió un error inesperado.' }: HandleErrorParams): void => {
  logger.error(msg, error);

  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Error de validación.',
      errors: error.errors,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
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
        // Mensaje más directo, similar al error de la base de datos
        responseMessage = `Falló la restricción de clave foránea en el campo: ${fieldName || 'desconocido'}.`;
        details = `El valor proporcionado para '${fieldName || 'desconocido'}' no existe en la tabla referenciada o una operación relacionada viola la integridad referencial.`;
        break;
      case 'P2025':
        responseStatusCode = 404;
        responseMessage = 'Error: El registro solicitado para la operación no fue encontrado.';
        break;

      default:
        responseStatusCode = 400;
        responseMessage = `Error de base de datos Prisma (Código: ${error.code}).`;
        break;
    }
    res.status(responseStatusCode).json({
      success: false,
      message: responseMessage,
      code: error.code,
      fields: responseFields, // Puede ser undefined si no aplica
      details: details, // Puede ser undefined si no aplica
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
        success: false,
        message: 'Error de validación de datos de la base de datos. Verifique los tipos y campos requeridos.',
        details: error.message.replace('\n', ''),
    });
    return;
  }


  // Para errores personalizados que tengan una propiedad statusCode y message
  if (error.statusCode && error.message) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    return;
  }

  // Fallback para errores genéricos
  res.status(statusCode).json({
    success: false,
    message: msg,
    error: process.env.NODE_ENV === 'development' ? error : undefined,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
};
