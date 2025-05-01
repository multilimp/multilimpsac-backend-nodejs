import { Router } from 'express';
import {
  listOrdenesCompra,
  createOrdenCompra,
  getOrdenCompra,
  updateOrdenCompra,
  deleteOrdenCompra,
  generateCode, // Opcional
} from './ordenCompra.controller';

const router = Router();

router.get('/', listOrdenesCompra);
router.post('/', createOrdenCompra);
router.get('/generate-code', generateCode); // Ruta opcional para generar código
router.get('/:ordenCompraId', getOrdenCompra);
router.put('/:ordenCompraId', updateOrdenCompra);
router.delete('/:ordenCompraId', deleteOrdenCompra);


export default router;
