import { Router } from 'express';
import * as ctrl from './ordenCompraPrivada.controller';
const router = Router();
router.get('/', ctrl.listOrdenCompraPrivada);
router.get('/:id', ctrl.getOrdenCompraPrivada);
router.post('/', ctrl.createOrdenCompraPrivada);
router.put('/:id', ctrl.updateOrdenCompraPrivada);
router.delete('/:id', ctrl.deleteOrdenCompraPrivada);
export default router;
