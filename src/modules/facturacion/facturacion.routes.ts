import { Router } from 'express';
import * as ctrl from './facturacion.controller';

const router = Router();
router.get('/', ctrl.listFacturacion);
router.get('/:id', ctrl.getFacturacion);
router.post('/', ctrl.createFacturacion);
router.put('/:id', ctrl.updateFacturacion);
router.patch('/:id', ctrl.partialUpdateFacturacion);
router.delete('/:id', ctrl.deleteFacturacion);

export default router;
