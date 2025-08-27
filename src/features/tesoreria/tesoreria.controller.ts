import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError';
import { processTesoreriaOp, processTesoreriaTransporte, processTesoreriaVentaPrivada, getTransporteAsignadoWithPagos, getTransportesByOrdenCompra, getPagosUrgentes, getPagosPorEstado } from './tesoreria.service';

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

export const getTransporteAsignadoForTesoreria = async (req: Request, res: Response) => {
  try {
    const { transporteAsignadoId } = req.params;
    const result = await getTransporteAsignadoWithPagos(Number(transporteAsignadoId));

    if (!result) {
      return res.status(404).json({ message: 'Transporte asignado no encontrado' });
    }

    res.status(200).json(result);
  } catch (error) {
    handleError({
      res,
      error,
      msg: 'Error al obtener el transporte asignado para tesorería.'
    });
  }
};

export const getTransportesByOrdenCompraForTesoreria = async (req: Request, res: Response) => {
  try {
    const { ordenCompraId } = req.params;
    const result = await getTransportesByOrdenCompra(Number(ordenCompraId));
    res.status(200).json(result);
  } catch (error) {
    handleError({
      res,
      error,
      msg: 'Error al obtener los transportes para tesorería.'
    });
  }
};

// ✅ NUEVO CONTROLADOR: Obtener pagos urgentes para notificaciones
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

// ✅ NUEVO CONTROLADOR: Obtener todos los pagos por estado (urgente y pendiente)
export const getPagosPorEstadoController = async (req: Request, res: Response) => {
  try {
    const result = await getPagosPorEstado();
    res.status(200).json(result);
  } catch (error) {
    handleError({
      res,
      error,
      msg: 'Error al obtener los pagos por estado.'
    });
  }
};
