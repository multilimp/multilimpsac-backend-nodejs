import { Router } from 'express';

import { listVentas, getVenta } from './ventas.controller';

const router = Router();

router.get('', listVentas);
router.get('/:ventaId', getVenta);

export default router;
