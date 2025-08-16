import { Request, Response } from 'express';
import { Usuario } from '@prisma/client';
import { handleError } from '../../shared/middleware/handleError';
import chatbotService from './chatbot.service';

interface AuthenticatedRequest extends Request {
  user?: Usuario;
}

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const userId = (req as AuthenticatedRequest).user?.id;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        message: 'El mensaje es obligatorio y debe ser texto' 
      });
    }

    if (!userId) {
      return res.status(401).json({ 
        message: 'Usuario no autenticado' 
      });
    }

    const response = await chatbotService.processMessage(message, userId);
    
    res.status(200).json({
      success: true,
      response
    });
  } catch (error) {
    handleError({ res, error, msg: 'Error procesando mensaje del chatbot' });
  }
};

export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    const { limit = 20 } = req.query;

    // Implementar historial de chat si lo necesitas
    // Por ahora retornamos array vacío
    res.status(200).json({
      success: true,
      messages: [],
      total: 0
    });
  } catch (error) {
    handleError({ res, error, msg: 'Error obteniendo historial del chat' });
  }
};

export const getQuickActions = async (req: Request, res: Response) => {
  try {
    const quickActions = [
      {
        id: 'clientes-activos',
        title: 'Clientes Activos',
        description: 'Ver lista de clientes activos',
        query: 'Muéstrame los clientes activos'
      },
      {
        id: 'ordenes-mes',
        title: 'Órdenes del Mes',
        description: 'Órdenes de compra de este mes',
        query: 'Lista las órdenes de compra de este mes'
      },
      {
        id: 'usuarios-sistema',
        title: 'Usuarios del Sistema',
        description: 'Ver todos los usuarios registrados',
        query: 'Cuántos usuarios hay en el sistema'
      },
      {
        id: 'ventas-resumen',
        title: 'Resumen de Ventas',
        description: 'Estadísticas de ventas recientes',
        query: 'Muéstrame un resumen de las ventas'
      }
    ];

    res.status(200).json({
      success: true,
      quickActions
    });
  } catch (error) {
    handleError({ res, error, msg: 'Error obteniendo acciones rápidas' });
  }
};
