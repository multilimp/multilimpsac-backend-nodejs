import { Router } from 'express';

import { listVentas, getVenta, analyzePdfForVenta,createVenta, updateVenta, deleteVenta, addOrdenCompraPrivada } from './ventas.controller';
import { add } from 'winston';

const router = Router();

router.get('', listVentas);
router.get('/:ventaId', getVenta);
router.post('/analyze-pdf', analyzePdfForVenta);
router.post('', createVenta);
router.post("/privada", addOrdenCompraPrivada);
router.put('/:ventaId', updateVenta);
// router.delete('/:ventaId', deleteVenta);
export default router;
