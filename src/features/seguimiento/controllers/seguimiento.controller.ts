import { Response } from 'express';
import { SeguimientoService } from '../services/seguimiento.service';
import { handleError } from '../../../shared/middleware/handleError';
import { AuthRequest } from '../../../shared/middleware/auth.middleware';

export class SeguimientoController {
  static async updateEstadoOpSeguimiento(req: AuthRequest, res: Response) {
    try {
      const { ordenProveedorId } = req.params;
      const { estado } = req.body;
      const usuarioId = req.user?.id;

      if (!usuarioId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const result = await SeguimientoService.updateEstadoOpSeguimiento(
        parseInt(ordenProveedorId),
        estado,
        usuarioId
      );

      res.status(200).json({
        message: 'Estado de seguimiento actualizado correctamente',
        data: result
      });
    } catch (error) {
      handleError({ res, error, msg: 'Error al actualizar estado de seguimiento' });
    }
  }

  static async marcarOpCompletado(req: AuthRequest, res: Response) {
    try {
      const { ordenProveedorId } = req.params;
      const usuarioId = req.user?.id;

      if (!usuarioId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const result = await SeguimientoService.marcarOpCompletado(
        parseInt(ordenProveedorId),
        usuarioId
      );

      res.status(200).json({
        message: 'OP marcada como completada correctamente',
        data: result
      });
    } catch (error) {
      handleError({ res, error, msg: 'Error al marcar OP como completada' });
    }
  }

  static async updateFechaEntregaReal(req: AuthRequest, res: Response) {
    try {
      const { ordenProveedorId } = req.params;
      const { fechaEntrega } = req.body;
      const usuarioId = req.user?.id;

      if (!usuarioId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const result = await SeguimientoService.updateFechaEntregaReal(
        parseInt(ordenProveedorId),
        new Date(fechaEntrega),
        usuarioId
      );

      res.status(200).json({
        message: 'Fecha de entrega real actualizada correctamente',
        data: result
      });
    } catch (error) {
      handleError({ res, error, msg: 'Error al actualizar fecha de entrega' });
    }
  }

  static async subirDocumentoEntregaCompleto(req: AuthRequest, res: Response) {
    try {
      const { ordenProveedorId } = req.params;
      const { documentoUrl } = req.body;
      const usuarioId = req.user?.id;

      if (!usuarioId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const result = await SeguimientoService.subirDocumentoEntregaCompleto(
        parseInt(ordenProveedorId),
        documentoUrl,
        usuarioId
      );

      res.status(200).json({
        message: 'Documento de entrega completo subido correctamente',
        data: result
      });
    } catch (error) {
      handleError({ res, error, msg: 'Error al subir documento de entrega' });
    }
  }

  static async getHistorialModificaciones(req: AuthRequest, res: Response) {
    try {
      const { ordenProveedorId } = req.params;

      const historial = await SeguimientoService.getHistorialModificaciones(
        parseInt(ordenProveedorId)
      );

      res.status(200).json({
        message: 'Historial de modificaciones obtenido correctamente',
        data: historial
      });
    } catch (error) {
      handleError({ res, error, msg: 'Error al obtener historial de modificaciones' });
    }
  }

  static async getOpsPendientesSeguimiento(req: AuthRequest, res: Response) {
    try {
      const ops = await SeguimientoService.getOpsPendientesSeguimiento();

      res.status(200).json({
        message: 'OPs pendientes de seguimiento obtenidas correctamente',
        data: ops
      });
    } catch (error) {
      handleError({ res, error, msg: 'Error al obtener OPs pendientes' });
    }
  }
}
