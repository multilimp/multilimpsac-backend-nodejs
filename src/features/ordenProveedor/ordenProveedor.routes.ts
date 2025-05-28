import { Router } from 'express';
import {
  listOrdenesProveedor,
  createOrdenProveedor,
  getOrdenProveedor,
  updateOrdenProveedor,
  getOrdenesProveedorByOrdenCompraId,
  deleteOrdenProveedor,
  listCodigosOrdenesProveedor,
} from './ordenProveedor.controller';

const router = Router();

router.get('/', listOrdenesProveedor);
router.get('/codigos', listCodigosOrdenesProveedor);
// router.get('/op', listOrdenesProveedor);

router.get('/:ordenCompraId/op', getOrdenesProveedorByOrdenCompraId);
router.post('/:ordenCompraId/op', createOrdenProveedor);

router.get('/:ordenProveedorId', getOrdenProveedor);
router.put('/:ordenProveedorId', updateOrdenProveedor);
router.delete('/:ordenProveedorId', deleteOrdenProveedor);

export default router;
