import { Router } from 'express';
import * as ctrl from './pagoOrdenCompraPrivada.controller';
const router = Router();
router.get('/', ctrl.listPagoOrdenCompraPrivada);
router.get('/:id', ctrl.getPagoOrdenCompraPrivada);
router.post('/', ctrl.createPagoOrdenCompraPrivada);
router.put('/:id', ctrl.updatePagoOrdenCompraPrivada);
router.delete('/:id', ctrl.deletePagoOrdenCompraPrivada);
export default router;
