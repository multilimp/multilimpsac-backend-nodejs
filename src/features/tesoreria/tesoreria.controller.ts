import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError';
import { processTesoreriaOp, processTesoreriaTransporte, processTesoreriaVentaPrivada } from './tesoreria.service';

export const createOrUpdatePagoOp = async (req: Request, res: Response) => {
  try {
    const result = await processTesoreriaOp(req.body);
    res.status(200).json(result);
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
    const result = await processTesoreriaTransporte(req.body);
    res.status(200).json(result);
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
    const result = await processTesoreriaVentaPrivada(req.body);
    res.status(200).json(result);
  } catch (error) {
    handleError({
      res,
      error,
      msg: 'Error al procesar el pago de venta privada.'
    });
  }
};
