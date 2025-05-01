import { Router } from 'express';
import * as ctrl from './ordenCompraAgrupada.controller';
const router = Router();
router.get('/', ctrl.listOrdenCompraAgrupada);
router.get('/:id', ctrl.getOrdenCompraAgrupada);
router.post('/', ctrl.createOrdenCompraAgrupada);
router.put('/:id', ctrl.updateOrdenCompraAgrupada);
router.delete('/:id', ctrl.deleteOrdenCompraAgrupada);
export default router;
