import { Router } from 'express';

import { listVentas, getVenta, analyzePdfForVenta, createVenta, updateVenta, deleteVenta, addOrdenCompraPrivada, patchVenta, calcularPromedioCobranza, updatePromedioCobranza } from './ventas.controller';

const router = Router();

router.get('', listVentas);
router.get('/:ventaId', getVenta);
router.get('/cliente/:clienteId/promedio-cobranza', calcularPromedioCobranza);
router.put('/cliente/:clienteId/promedio-cobranza', updatePromedioCobranza);
router.post('/analyze-pdf', analyzePdfForVenta);
router.post('', createVenta);
router.post('/privada', addOrdenCompraPrivada);
router.put('/:ventaId', updateVenta);
router.patch('/:ventaId', patchVenta);
// router.delete('/:ventaId', deleteVenta);
export default router;
