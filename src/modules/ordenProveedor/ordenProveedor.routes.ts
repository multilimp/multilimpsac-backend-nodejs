import { Router } from 'express';
import {
  listOrdenesProveedor,
  createOrdenProveedor,
  getOrdenProveedor,
  updateOrdenProveedor,
  deleteOrdenProveedor,
} from './ordenProveedor.controller';

const router = Router();

router.get('/', listOrdenesProveedor);
router.post('/', createOrdenProveedor);
router.get('/:ordenProveedorId', getOrdenProveedor);
router.put('/:ordenProveedorId', updateOrdenProveedor);
router.delete('/:ordenProveedorId', deleteOrdenProveedor);

export default router;
