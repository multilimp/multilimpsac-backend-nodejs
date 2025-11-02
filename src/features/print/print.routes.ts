import { Router } from 'express';
import { getOrdenProveedorPrintDataHandler, getCargosEntregaData, getCotizacionPrintDataHandler } from './print.controller';

const router = Router();

// Generar PDF de orden de proveedor
router.get('/orden-proveedor/:id', getOrdenProveedorPrintDataHandler);

// Generar PDF de cotización
router.get('/cotizacion/:id', getCotizacionPrintDataHandler);

// Ruta para obtener datos JSON de Reporte de Programación (para frontend)
router.get('/cargos-entrega/data', getCargosEntregaData);

export default router;
