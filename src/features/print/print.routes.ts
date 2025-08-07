import { Router } from 'express';
import { generateFacturaPDFHandler, generateOrdenProveedorPDFHandler } from './print.controller';

const router = Router();

// Generar PDF de factura por orden de compra
router.post('/factura/:ordenCompraId', generateFacturaPDFHandler); // ✅ CORRECCIÓN: Cambiar parámetro

// Generar PDF de orden de proveedor
router.post('/orden-proveedor/:id', generateOrdenProveedorPDFHandler);

export default router;
