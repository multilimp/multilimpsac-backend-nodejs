import { Router } from 'express';
import {
  createOrUpdatePagoOp,
  createOrUpdatePagoTransporte,
  createOrUpdatePagoVentaPrivada,
  getTransporteAsignadoForTesoreria,
  getTransportesByOrdenCompraForTesoreria,
  getPagosUrgentesController,
  getPagosPorEstadoController
} from './tesoreria.controller';

const router = Router();

// Rutas existentes para crear/actualizar pagos
router.post('/op', createOrUpdatePagoOp);
router.post('/transporte', createOrUpdatePagoTransporte);
router.post('/venta-privada', createOrUpdatePagoVentaPrivada);

// ✅ NUEVAS rutas para consultar transportes desde tesorería
router.get('/transporte/:transporteAsignadoId', getTransporteAsignadoForTesoreria);
router.get('/transportes/orden-compra/:ordenCompraId', getTransportesByOrdenCompraForTesoreria);

// ✅ NUEVA ruta para obtener pagos urgentes (notificaciones)
router.get('/pagos-urgentes', getPagosUrgentesController);

// ✅ NUEVA ruta para obtener todos los pagos por estado (dashboard tesorería)
router.get('/pagos-por-estado', getPagosPorEstadoController);

export default router;
