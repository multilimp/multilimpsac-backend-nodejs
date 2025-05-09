import { Router } from 'express';

import { listVentas, getVenta, analyzePdfForVenta } from './ventas.controller';

const router = Router();

router.get('', listVentas);
router.get('/:ventaId', getVenta);
router.post('/analyze-pdf', analyzePdfForVenta);

export default router;
