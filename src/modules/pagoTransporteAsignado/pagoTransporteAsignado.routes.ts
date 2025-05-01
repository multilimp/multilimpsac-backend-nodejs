import { Router } from 'express';
import * as ctrl from './pagoTransporteAsignado.controller';
const router = Router();
router.get('/', ctrl.listPagoTransporteAsignado);
router.get('/:id', ctrl.getPagoTransporteAsignado);
router.post('/', ctrl.createPagoTransporteAsignado);
router.put('/:id', ctrl.updatePagoTransporteAsignado);
router.delete('/:id', ctrl.deletePagoTransporteAsignado);
export default router;
