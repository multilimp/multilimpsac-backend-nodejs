import { Router } from 'express';

import { listVentas, getVenta, createVenta, updateVenta, deleteVenta } from './ventas.controller';

const router = Router();

router.get('', listVentas);
router.get('/:ventaId', getVenta);
router.post('', createVenta);
router.put('/:ventaId', updateVenta);
router.delete('/:ventaId', deleteVenta);
export default router;
