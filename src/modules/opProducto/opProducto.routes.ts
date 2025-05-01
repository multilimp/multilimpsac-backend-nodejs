import { Router } from 'express';
import * as ctrl from './opProducto.controller';
const router = Router();
router.get('/', ctrl.listOpProducto);
router.get('/:id', ctrl.getOpProducto);
router.post('/', ctrl.createOpProducto);
router.put('/:id', ctrl.updateOpProducto);
router.delete('/:id', ctrl.deleteOpProducto);
export default router;
