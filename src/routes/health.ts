import { Request, Response } from 'express';
import prisma from '../database/prisma';
import logger from '../shared/config/logger';

export const healthCheck = async (req: Request, res: Response) => {
  try {
    // Verificar conexión a BD
    await prisma.$queryRaw`SELECT 1 as health_check`;
    
    res.status(200).json({
      status: 'ok',
      service: 'MULTILIMP ERP',
      database: 'connected',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
    
    logger.info('Health check exitoso');
  } catch (error) {
    logger.error('Health check falló:', error);
    
    res.status(500).json({
      status: 'error',
      service: 'MULTILIMP ERP',
      database: 'disconnected',
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
};
