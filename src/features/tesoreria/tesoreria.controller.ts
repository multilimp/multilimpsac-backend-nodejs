import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError';
import { getPagosUrgentes, getPagosPendientes, getPagosPorEstado } from './tesoreria.service';

export const createOrUpdatePagoOp = async (req: Request, res: Response) => {
  try {
    // TODO: Implementar función processTesoreriaOp
    // const result = await processTesoreriaOp(req.body);
    res.status(501).json({ message: 'Función temporalmente deshabilitada' });
  } catch (error) {
    handleError({
      res,
      error,
      msg: 'Error al procesar el pago de orden proveedor.'
    });
  }
};

export const createOrUpdatePagoTransporte = async (req: Request, res: Response) => {
  try {
    // TODO: Implementar función processTesoreriaTransporte
    // const result = await processTesoreriaTransporte(req.body);
    res.status(501).json({ message: 'Función temporalmente deshabilitada' });
  } catch (error) {
    handleError({
      res,
      error,
      msg: 'Error al procesar el pago de transporte.'
    });
  }
};

export const createOrUpdatePagoVentaPrivada = async (req: Request, res: Response) => {
  try {
    // TODO: Implementar función processTesoreriaVentaPrivada
    // const result = await processTesoreriaVentaPrivada(req.body);
    res.status(501).json({ message: 'Función temporalmente deshabilitada' });
  } catch (error) {
    handleError({
      res,
      error,
      msg: 'Error al procesar el pago de venta privada.'
    });
  }
};

export const getPagosUrgentesController = async (req: Request, res: Response) => {
  try {
    const result = await getPagosUrgentes();
    res.status(200).json(result);
  } catch (error) {
    handleError({
      res,
      error,
      msg: 'Error al obtener los pagos urgentes.'
    });
  }
};

export const getPagosPendientesController = async (req: Request, res: Response) => {
  try {
    const result = await getPagosPendientes();
    res.status(200).json(result);
  } catch (error) {
    handleError({
      res,
      error,
      msg: 'Error al obtener los pagos pendientes.'
    });
  }
};

export const getPagosPorEstadoController = async (req: Request, res: Response) => {
  try {
    const { estado } = req.query;
    
    if (!estado || (estado !== 'URGENTE' && estado !== 'PENDIENTE')) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro estado es requerido y debe ser URGENTE o PENDIENTE'
      });
    }

    const result = await getPagosPorEstado(estado as 'URGENTE' | 'PENDIENTE');
    res.status(200).json(result);
  } catch (error) {
    handleError({
      res,
      error,
      msg: 'Error al obtener los pagos por estado.'
    });
  }
};
