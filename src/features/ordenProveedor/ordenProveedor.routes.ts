import { Router } from 'express';
import {
  listOrdenesProveedor,
  createOrdenProveedor,
  getOrdenProveedor,
  updateOrdenProveedor,
  getOrdenesProveedorByOrdenCompraId,
  deleteOrdenProveedor,
} from './ordenProveedor.controller';

const router = Router();

router.get('/', listOrdenesProveedor);
router.get('/op', listOrdenesProveedor);

router.get('/:ordenCompraId/op', getOrdenesProveedorByOrdenCompraId);
router.post('/:ordenCompraId/op', createOrdenProveedor);

router.get('/list-op', listOrdenesProveedor);
router.get('/ordenCompraId', getOrdenesProveedorByOrdenCompraId);
router.post('/:ordenCompraId', createOrdenProveedor);
router.get('/:ordenProveedorId', getOrdenProveedor);
router.put('/:ordenProveedorId', updateOrdenProveedor);
router.delete('/:ordenProveedorId', deleteOrdenProveedor);

export default router;
