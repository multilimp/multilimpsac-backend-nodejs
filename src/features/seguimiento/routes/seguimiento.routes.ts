import { Router } from 'express';
import { SeguimientoController } from '../controllers/seguimiento.controller';
import { validateRequest } from '../../../entities/contact/contact.validation';
import { 
  UpdateEstadoOpSeguimientoDto, 
  UpdateFechaEntregaRealDto, 
  SubirDocumentoEntregaCompletoDto 
} from '../dto/seguimiento.dto';

const router = Router();

router.put('/op/:ordenProveedorId/estado', validateRequest(UpdateEstadoOpSeguimientoDto), SeguimientoController.updateEstadoOpSeguimiento);
router.put('/op/:ordenProveedorId/completar', SeguimientoController.marcarOpCompletado);
router.put('/op/:ordenProveedorId/fecha-entrega', validateRequest(UpdateFechaEntregaRealDto), SeguimientoController.updateFechaEntregaReal);
router.put('/op/:ordenProveedorId/documento-entrega', validateRequest(SubirDocumentoEntregaCompletoDto), SeguimientoController.subirDocumentoEntregaCompleto);
router.get('/op/:ordenProveedorId/historial', SeguimientoController.getHistorialModificaciones);
router.get('/ops-pendientes', SeguimientoController.getOpsPendientesSeguimiento);

export default router;
