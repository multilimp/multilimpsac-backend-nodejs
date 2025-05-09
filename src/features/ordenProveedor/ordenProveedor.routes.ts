import { Router } from 'express';
import {
  listOrdenesProveedor,
  createOrdenProveedor,
  getOrdenProveedor,
  updateOrdenProveedor,
  getOrdenesProveedorByOrdenCompraId,
} from './ordenProveedor.controller';

const router = Router();

router.get('/', listOrdenesProveedor);
router.get('/list-op', listOrdenesProveedor);
router.get('/ordenCompraId', getOrdenesProveedorByOrdenCompraId);
router.post('/', createOrdenProveedor);
router.get('/:ordenProveedorId', getOrdenProveedor);
router.put('/:ordenProveedorId', updateOrdenProveedor);

export default router;
