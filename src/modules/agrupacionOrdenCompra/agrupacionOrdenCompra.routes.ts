import { Router } from 'express';
import {
  listAgrupaciones,
  createAgrupacion,
  getAgrupacion,
  updateAgrupacion,
  deleteAgrupacion,
  addOrdenCompra,
  removeOrdenCompra,
} from './agrupacionOrdenCompra.controller';

const router = Router();

router.get('/', listAgrupaciones);
router.post('/', createAgrupacion);
router.get('/:agrupacionId', getAgrupacion);
router.put('/:agrupacionId', updateAgrupacion);
router.delete('/:agrupacionId', deleteAgrupacion);

// Rutas para manejar la relación con OrdenCompra
router.post('/:agrupacionId/ordenes-compra', addOrdenCompra); // Añadir OC a agrupación
router.delete('/:agrupacionId/ordenes-compra/:ordenCompraId', removeOrdenCompra); // Quitar OC de agrupación

export default router;
