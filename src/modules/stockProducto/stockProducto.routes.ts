import { Router } from 'express';
import * as ctrl from './stockProducto.controller';
const router = Router();
router.get('/', ctrl.listStockProducto);
router.get('/:id', ctrl.getStockProducto);
router.post('/', ctrl.createStockProducto);
router.put('/:id', ctrl.updateStockProducto);
router.delete('/:id', ctrl.deleteStockProducto);
export default router;
