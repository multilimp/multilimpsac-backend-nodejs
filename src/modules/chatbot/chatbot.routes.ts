import { Router } from 'express';
import { sendMessage, getChatHistory, getQuickActions } from './chatbot.controller';
import { authenticateToken } from '../../shared/middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Enviar mensaje al chatbot
router.post('/message', sendMessage);

// Obtener historial de chat
router.get('/history', getChatHistory);

// Obtener acciones rápidas predefinidas
router.get('/quick-actions', getQuickActions);

export default router;
