import { Router } from 'express';
import { generateFacturaPDFHandler, generateOrdenProveedorPDFHandler } from './print.controller';

const router = Router();

// Generar PDF de factura
router.post('/factura/:id', generateFacturaPDFHandler);

// Generar PDF de orden de proveedor
router.post('/orden-proveedor/:id', generateOrdenProveedorPDFHandler);

export default router;
