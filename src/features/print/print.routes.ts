import { Router } from 'express';
import { generateFacturaPDFHandler } from './print.controller';

const router = Router();

// Por ahora usaremos POST para facilitar el envío de datos si fuera necesario en el futuro,
// aunque para un ID podría ser GET. Se puede ajustar según la necesidad final.
router.post('/factura/:id', generateFacturaPDFHandler);
// Si se prefiere GET:
// router.get('/factura/:id', generateFacturaPDFHandler);

export default router;
