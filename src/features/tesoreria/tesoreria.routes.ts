import { Router } from 'express';
import { createOrUpdatePagoOp, createOrUpdatePagoTransporte, createOrUpdatePagoVentaPrivada } from './tesoreria.controller';

const router = Router();

router.post('/op', createOrUpdatePagoOp);
router.post('/transporte', createOrUpdatePagoTransporte);
router.post('/venta-privada', createOrUpdatePagoVentaPrivada);

export default router;
