import { Router } from 'express';
const { chatbotService } = require('../services/chatbot/chatbot.service');

const router = Router();

// Ruta para procesar mensajes del chatbot
router.post('/message', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                error: 'Mensaje requerido y debe ser un string'
            });
        }

        const response = await chatbotService.processQuery(message);

        res.json({
            response: {
                message: response,
                data: null,
                visualization: null,
                suggestions: []
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error en ruta /message:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// Ruta para obtener acciones rápidas
router.get('/quick-actions', async (req, res) => {
    try {
        const quickActions = await chatbotService.getQuickActions();

        res.json({
            quickActions,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error en ruta /quick-actions:', error);
        res.status(500).json({
            error: 'Error obteniendo acciones rápidas'
        });
    }
});

// Ruta para obtener estadísticas del dashboard
router.get('/stats', async (req, res) => {
    try {
        const stats = await chatbotService.getDashboardStats();

        res.json({
            stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error en ruta /stats:', error);
        res.status(500).json({
            error: 'Error obteniendo estadísticas'
        });
    }
});

// Ruta de health check
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'Chatbot Service',
        timestamp: new Date().toISOString()
    });
});

export default router;
