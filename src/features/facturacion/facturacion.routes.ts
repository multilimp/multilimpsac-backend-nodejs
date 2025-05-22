import { Router } from 'express';
import {
  handleCreateOrUpdateFacturacion,
  handleGetFacturacionById,
  handleGetFacturacionByOrdenCompraId
} from './facturacion.controller';

const router = Router();

router.get('/orden-compra/:ordenCompraId', handleGetFacturacionByOrdenCompraId);

router.post('/orden-compra/:ordenCompraId', handleCreateOrUpdateFacturacion);

router.get('/:id', handleGetFacturacionById);

export default router;
