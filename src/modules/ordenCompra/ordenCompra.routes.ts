import { Router } from 'express';
import {
  listOrdenesCompra,
  createOrdenCompra,
  getOrdenCompra,
  updateOrdenCompra,
  patchOrdenCompra,
  deleteOrdenCompra,
  generateCode, // Opcional
} from './ordenCompra.controller';

const router = Router();

router.get('/', listOrdenesCompra);
router.post('/', createOrdenCompra);

router.get('/:ordenCompraId', getOrdenCompra);
router.put('/:ordenCompraId', updateOrdenCompra);
router.patch('/:ordenCompraId', patchOrdenCompra);
router.delete('/:ordenCompraId', deleteOrdenCompra);

export default router;
