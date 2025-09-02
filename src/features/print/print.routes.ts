import { Router } from 'express';
import { generateOrdenProveedorPDFHandler, getCargosEntregaData } from './print.controller';

const router = Router();

// Generar PDF de orden de proveedor
router.get('/orden-proveedor/:id', generateOrdenProveedorPDFHandler);

// Ruta para obtener datos JSON de cargos de entrega (para frontend)
router.get('/cargos-entrega/data', getCargosEntregaData);

export default router;
