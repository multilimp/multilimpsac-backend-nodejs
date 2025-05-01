import { Router } from 'express';
import {
  listProductos,
  createProducto,
  getProducto,
  updateProducto,
  deleteProducto,
} from './producto.controller';

const router = Router();

router.get('/', listProductos);
router.post('/', createProducto);
router.get('/:productoId', getProducto);
router.put('/:productoId', updateProducto);
router.delete('/:productoId', deleteProducto);

export default router;
