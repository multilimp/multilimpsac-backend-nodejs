import { Router } from 'express';
import { generateOrdenProveedorPDFHandler, getCargosEntregaHtml, getCargosEntregaReport } from './print.controller';

const router = Router();

// Generar PDF de orden de proveedor
router.get('/orden-proveedor/:id', generateOrdenProveedorPDFHandler);
// Ruta para generar reporte de cargos de entrega por rango de fechas
router.get('/cargos-entrega', getCargosEntregaReport);

// Ruta para previsualizar reporte de cargos de entrega en HTML
router.get('/cargos-entrega/html', getCargosEntregaHtml);

export default router;
