import { Router } from 'express';
import * as ctrl from './pagoOrdenProveedor.controller';
const router = Router();
router.get('/', ctrl.listPagoOrdenProveedor);
router.get('/:id', ctrl.getPagoOrdenProveedor);
router.post('/', ctrl.createPagoOrdenProveedor);
router.put('/:id', ctrl.updatePagoOrdenProveedor);
router.delete('/:id', ctrl.deletePagoOrdenProveedor);
export default router;
