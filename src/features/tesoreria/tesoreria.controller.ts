import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError';
import { getPagosPorEstadoOptimizado, getPagosUrgentesOptimizado } from './tesoreria.service';

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

export const getTransporteAsignadoForTesoreria = async (req: Request, res: Response) => {
  try {
    const { transporteAsignadoId } = req.params;
    // TODO: Implementar función getTransporteAsignadoWithPagos
    // const result = await getTransporteAsignadoWithPagos(Number(transporteAsignadoId));

    res.status(501).json({ message: 'Función temporalmente deshabilitada' });
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
    // TODO: Implementar función getTransportesByOrdenCompra
    // const result = await getTransportesByOrdenCompra(Number(ordenCompraId));
    res.status(501).json({ message: 'Función temporalmente deshabilitada' });
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
    const result = await getPagosUrgentesOptimizado();
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
    const result = await getPagosPorEstadoOptimizado();
    res.status(200).json(result);
  } catch (error) {
    handleError({
      res,
      error,
      msg: 'Error al obtener los pagos por estado.'
    });
  }
};
