import { Router } from 'express';
import {
  createOrUpdatePagoOp,
  createOrUpdatePagoTransporte,
  createOrUpdatePagoVentaPrivada,
  getPagosUrgentesController,
  getPagosPendientesController,
  getPagosPorEstadoController
} from './tesoreria.controller';

const router = Router();

// Rutas existentes para crear/actualizar pagos
router.post('/op', createOrUpdatePagoOp);
router.post('/transporte', createOrUpdatePagoTransporte);
router.post('/venta-privada', createOrUpdatePagoVentaPrivada);

// Rutas para consultar pagos
router.get('/pagos-urgentes', getPagosUrgentesController);
router.get('/pagos-pendientes', getPagosPendientesController);
router.get('/pagos-por-estado', getPagosPorEstadoController);

export default router;
