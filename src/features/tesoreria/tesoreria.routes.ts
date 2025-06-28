import { Router } from 'express';
import { 
  createOrUpdatePagoOp, 
  createOrUpdatePagoTransporte, 
  createOrUpdatePagoVentaPrivada,
  getTransporteAsignadoForTesoreria,
  getTransportesByOrdenCompraForTesoreria
} from './tesoreria.controller';

const router = Router();

// Rutas existentes para crear/actualizar pagos
router.post('/op', createOrUpdatePagoOp);
router.post('/transporte', createOrUpdatePagoTransporte);
router.post('/venta-privada', createOrUpdatePagoVentaPrivada);

// ✅ NUEVAS rutas para consultar transportes desde tesorería
router.get('/transporte/:transporteAsignadoId', getTransporteAsignadoForTesoreria);
router.get('/transportes/orden-compra/:ordenCompraId', getTransportesByOrdenCompraForTesoreria);

export default router;
