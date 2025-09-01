import { Router } from 'express';
import { getCargosEntregaReport } from './reportes.controller';

const router = Router();

// Ruta para generar reporte de cargos de entrega por rango de fechas
router.get('/cargos-entrega', getCargosEntregaReport);

export default router;
