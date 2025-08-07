import { Router } from 'express';
import { generateOrdenProveedorPDFHandler } from './print.controller';

const router = Router();

// Generar PDF de orden de proveedor
router.get('/orden-proveedor/:id', generateOrdenProveedorPDFHandler);

export default router;
