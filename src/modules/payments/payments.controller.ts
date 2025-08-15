import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError';
import * as service from './payments.service';

export const updatePayments = async (req: Request, res: Response) => {
  try {
    const { entityType, entityId, payments, tipoPago, notaPago } = req.body;

    if (!entityType || !entityId) {
      return res.status(400).json({ 
        message: 'entityType y entityId son requeridos' 
      });
    }

    if (!['ordenCompraPrivada', 'ordenProveedor', 'transporteAsignado'].includes(entityType)) {
      return res.status(400).json({ 
        message: 'entityType debe ser: ordenCompraPrivada, ordenProveedor o transporteAsignado' 
      });
    }

    const result = await service.updatePayments({
      entityType,
      entityId: parseInt(entityId, 10),
      payments: payments || [],
      tipoPago,
      notaPago
    });

    res.status(200).json(result);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar pagos' });
  }
};

export const getPaymentsByEntity = async (req: Request, res: Response) => {
  try {
    const { entityType, entityId } = req.params;

    if (!entityType || !entityId) {
      return res.status(400).json({ 
        message: 'entityType y entityId son requeridos' 
      });
    }

    if (!['ordenCompraPrivada', 'ordenProveedor', 'transporteAsignado'].includes(entityType)) {
      return res.status(400).json({ 
        message: 'entityType debe ser: ordenCompraPrivada, ordenProveedor o transporteAsignado' 
      });
    }

    const payments = await service.getPaymentsByEntity(
      entityType as 'ordenCompraPrivada' | 'ordenProveedor' | 'transporteAsignado',
      parseInt(entityId, 10)
    );

    res.status(200).json(payments);
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener pagos' });
  }
};
