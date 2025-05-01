import { Router } from 'express';
import * as ctrl from './cotizacionProducto.controller';

const router = Router();

router.get('/', ctrl.listCotizacionProductos);
router.get('/:id', ctrl.getCotizacionProducto);
router.post('/', ctrl.createCotizacionProducto);
router.put('/:id', ctrl.updateCotizacionProducto);
router.delete('/:id', ctrl.deleteCotizacionProducto);

export default router;
