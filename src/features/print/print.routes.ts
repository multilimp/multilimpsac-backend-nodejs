import { Router } from 'express';
import { generateOrdenProveedorPDFHandler } from './print.controller';
// import { generateFacturaPDFHandler } from './print.controller'; // Comentado temporalmente

const router = Router();

// Generar PDF de factura por orden de compra (comentado temporalmente)
// router.post('/factura/:ordenCompraId', generateFacturaPDFHandler);

// Generar PDF de orden de proveedor
router.get('/orden-proveedor/:id', generateOrdenProveedorPDFHandler);

export default router;
