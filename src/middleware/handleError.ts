import { Response } from 'express';
import logger from '../../config/logger';

interface HandleErrorParams {
  res: Response;
  error: any; // O un tipo de error más específico si lo tienes
  msg?: string;
  statusCode?: number; // Añadir opción para código de estado personalizado
}

export const handleError = ({ res, error, msg, statusCode = 500 }: HandleErrorParams): Response => {
  // Usar el logger para registrar el error
  logger.error(msg || error?.message || 'Error desconocido', { error });

  // Devolver una respuesta JSON estandarizada
  return res.status(statusCode).json({
    success: false,
    message: msg ?? error?.message ?? 'Ocurrió un error inesperado',
    // Opcional: No exponer detalles del error en producción
    // error: process.env.NODE_ENV === 'development' ? error : undefined,
  });
};
