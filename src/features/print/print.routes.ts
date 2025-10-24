import { Router } from 'express';
import { getOrdenProveedorPrintDataHandler, getCargosEntregaData } from './print.controller';

const router = Router();

// Generar PDF de orden de proveedor
router.get('/orden-proveedor/:id', getOrdenProveedorPrintDataHandler);

// Ruta para obtener datos JSON de Reporte de Programación (para frontend)
router.get('/cargos-entrega/data', getCargosEntregaData);

export default router;
