import { Router } from 'express';
import {
  // Almacenes
  listAlmacenes,
  createAlmacen,
  getAlmacen,
  updateAlmacen,
  deleteAlmacen,
  // Productos
  listProductos,
  createProducto,
  getProducto,
  updateProducto,
  deleteProducto,
  // Stock
  listStock,
  getStockByAlmacen,
  getStockByProducto,
  createOrUpdateStock,
  updateStock,
  deleteStock,
  listMovimientosByStock,
} from './almacen.controller';

const router = Router();

// ============ RUTAS DE ALMACENES ============
router.get('/', listAlmacenes);
router.post('/', createAlmacen);
router.get('/:almacenId', getAlmacen);
router.put('/:almacenId', updateAlmacen);
router.delete('/:almacenId', deleteAlmacen);

// ============ RUTAS DE PRODUCTOS ============
router.get('/productos/list', listProductos);
router.post('/productos', createProducto);
router.get('/productos/:productoId', getProducto);
router.put('/productos/:productoId', updateProducto);
router.delete('/productos/:productoId', deleteProducto);

// ============ RUTAS DE STOCK ============
router.get('/stock/list', listStock);
router.get('/stock/almacen/:almacenId', getStockByAlmacen);
router.get('/stock/producto/:productoId', getStockByProducto);
router.post('/stock', createOrUpdateStock);
router.put('/stock/:productoId/:almacenId', updateStock);
router.delete('/stock/:productoId/:almacenId', deleteStock);
router.get('/stock/movimientos/:productoId/:almacenId', listMovimientosByStock);

export default router;
