import { Router } from 'express';
import {
  listCodigosOrdenesProveedor,
  listOrdenesProveedor,
  getOrdenesProveedorByOrdenCompraId,
  createOrdenProveedor,
  getOrdenProveedor,
  updateOrdenProveedor,
  patchOrdenProveedor,
} from './ordenProveedor.controller';

const router = Router();

router.get('/', listOrdenesProveedor);

// Rutas específicas ANTES que las rutas con parámetros dinámicos
router.get('/:ordenCompraId/codigos', listCodigosOrdenesProveedor);
router.get('/:ordenCompraId/op', getOrdenesProveedorByOrdenCompraId);
router.post('/:ordenCompraId/op', createOrdenProveedor);

// Rutas con ID específico de OP DESPUÉS
router.get('/op/:ordenProveedorId', getOrdenProveedor);
router.put('/op/:ordenProveedorId', updateOrdenProveedor);
router.patch('/op/:ordenProveedorId', patchOrdenProveedor);
// router.delete('/op/:ordenProveedorId', deleteOrdenProveedor);

export default router;
