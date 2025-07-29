import { Router } from 'express';
import {
  getOpProductosByOrdenProveedor,
  getOpProducto,
  createOpProductoController,
  updateOpProductoController,
  deleteOpProductoController,
  updateMultipleOpProductosController,
} from './opProducto.controller';

const router = Router();

// GET /api/op-productos/orden/:ordenProveedorId - Obtener productos por OP
router.get('/orden/:ordenProveedorId', getOpProductosByOrdenProveedor);

// GET /api/op-productos/:id - Obtener producto específico
router.get('/:id', getOpProducto);

// POST /api/op-productos - Crear nuevo producto
router.post('/', createOpProductoController);

// PUT /api/op-productos/:id - Actualizar producto específico
router.put('/:id', updateOpProductoController);

// DELETE /api/op-productos/:id - Eliminar producto específico
router.delete('/:id', deleteOpProductoController);

// PUT /api/op-productos/orden/:ordenProveedorId/bulk - Actualizar múltiples productos
router.put('/orden/:ordenProveedorId/bulk', updateMultipleOpProductosController);

export default router;
