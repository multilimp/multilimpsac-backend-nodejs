import { Router } from 'express';

import { listVentas, getVenta, analyzePdfForVenta } from './ventas.controller';
import { listVentas, getVenta, createVenta, updateVenta, deleteVenta } from './ventas.controller';

const router = Router();

router.get('', listVentas);
router.get('/:ventaId', getVenta);
router.post('/analyze-pdf', analyzePdfForVenta);

router.post('', createVenta);
router.put('/:ventaId', updateVenta);
router.delete('/:ventaId', deleteVenta);
export default router;
