import { Request, Response } from 'express';
import { handleError } from '../../../shared/middleware/handleError';
import * as ventasService from './ventas.service';

export const listVentas = async (req: Request, res: Response) => {
  try {
    const page     = Number(req.query.page)     || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const filters  = {
      clienteId: req.query.clienteId ? Number(req.query.clienteId) : undefined,
      minPrice:  req.query.minPrice  ? Number(req.query.minPrice)  : undefined,
      maxPrice:  req.query.maxPrice  ? Number(req.query.maxPrice)  : undefined,
      fechaFrom: req.query.fechaFrom as string,
      fechaTo:   req.query.fechaTo   as string,
      search:    req.query.search    as string
    };

    const result = await ventasService.getAllVentas(page, pageSize, filters);
    res.status(200).json(result);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar las ventas' });
  }
};

export const getVenta = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.ventaId, 10);
    if (isNaN(id)) throw new Error('NOT_FOUND');

    const venta = await ventasService.getVentaById(id);
    if (!venta) throw new Error('NOT_FOUND');

    res.status(200).json(venta);
  } catch (error) {
    handleError({ res, statusCode: 404, error });
  }
};


export const createVenta = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const nuevaVenta = await ventasService.createVenta(data);
    res.status(201).json(nuevaVenta);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear la venta' });
  }
};


export const updateVenta = async (req: Request, res: Response) => {
  try {
    const id   = parseInt(req.params.ventaId, 10);
    const data = req.body;
    if (isNaN(id)) throw new Error('NOT_FOUND');

    const updated = await ventasService.updateVenta(id, data);
    res.status(200).json(updated);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar la venta' });
  }
};

export const deleteVenta = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.ventaId, 10);
    if (isNaN(id)) throw new Error('NOT_FOUND');

    const inactivated = await ventasService.deleteVenta(id);
    res.status(200).json(inactivated);
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar la venta' });
  }
};
