import { Router } from 'express';
import * as ctrl from './transporteAsignado.controller';
const router = Router();
router.get('/', ctrl.listTransporteAsignado);
router.get('/:id', ctrl.getTransporteAsignado);
router.post('/', ctrl.createTransporteAsignado);
router.put('/:id', ctrl.updateTransporteAsignado);
router.delete('/:id', ctrl.deleteTransporteAsignado);
export default router;
