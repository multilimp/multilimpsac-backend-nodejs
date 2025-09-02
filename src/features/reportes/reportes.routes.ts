import { Router } from 'express';
import { getCargosEntregaReport, getCargosEntregaHtml } from './reportes.controller';

const router = Router();

// Ruta para generar reporte de cargos de entrega por rango de fechas
router.get('/cargos-entrega', getCargosEntregaReport);

// Ruta para previsualizar reporte de cargos de entrega en HTML
router.get('/cargos-entrega/html', getCargosEntregaHtml);

export default router;
