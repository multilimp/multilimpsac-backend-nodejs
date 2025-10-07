import { Router } from 'express';
import {
  createOrUpdatePagoOp,
  createOrUpdatePagoTransporte,
  createOrUpdatePagoVentaPrivada,
  getPagosUrgentesController,
  getPagosPendientesController
} from './tesoreria.controller';

const router = Router();

// Rutas existentes para crear/actualizar pagos
router.post('/op', createOrUpdatePagoOp);
router.post('/transporte', createOrUpdatePagoTransporte);
router.post('/venta-privada', createOrUpdatePagoVentaPrivada);

// Rutas para consultar pagos
router.get('/pagos-urgentes', getPagosUrgentesController);
router.get('/pagos-pendientes', getPagosPendientesController);

export default router;
