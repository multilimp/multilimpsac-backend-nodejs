import { Request, Response } from 'express';
import * as service from './facturacion.service';
import { handleError } from '../../shared/middleware/handleError';
export const listFacturacion = async (req: Request, res: Response) => {
  try {
    const items = await service.getAllFacturacion();
    res.status(200).json(items);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar facturaciones' });
  }
};
export const getFacturacion = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const item = await service.getFacturacionById(id);
    if (!item) return res.status(404).json({ message: 'No encontrado' });
    res.status(200).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener facturacion' });
  }
};

export const getFacturacionesByOrdenCompraId = async (req: Request, res: Response) => {
  try {
    const ordenCompraId = parseInt(req.params.ordenCompraId, 10);
    if (isNaN(ordenCompraId)) return res.status(400).json({ message: 'ID de orden de compra inválido' });
    const items = await service.getFacturacionesByOrdenCompraId(ordenCompraId);
    res.status(200).json(items);
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener facturaciones por orden de compra' });
  }
};
export const createFacturacion = async (req: Request, res: Response) => {
  try {
    const item = await service.createFacturacion(req.body);
    res.status(201).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear facturacion' });
  }
};
export const updateFacturacion = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const item = await service.updateFacturacion(id, req.body);
    res.status(200).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar facturacion' });
  }
};

export const partialUpdateFacturacion = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const item = await service.partialUpdateFacturacion(id, req.body);
    res.status(200).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar parcialmente facturacion' });
  }
};

export const deleteFacturacion = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    await service.deleteFacturacion(id);
    res.status(204).send();
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar facturacion' });
  }
};
