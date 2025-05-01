import { Request, Response } from 'express';
import * as service from './stockProducto.service';
import { handleError } from '../../shared/middleware/handleError';
export const listStockProducto = async (req: Request, res: Response) => {
  try {
    const items = await service.getAllStockProducto();
    res.status(200).json(items);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar stock productos' });
  }
};
export const getStockProducto = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const item = await service.getStockProductoById(id);
    if (!item) return res.status(404).json({ message: 'No encontrado' });
    res.status(200).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener stock producto' });
  }
};
export const createStockProducto = async (req: Request, res: Response) => {
  try {
    const item = await service.createStockProducto(req.body);
    res.status(201).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear stock producto' });
  }
};
export const updateStockProducto = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const item = await service.updateStockProducto(id, req.body);
    res.status(200).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar stock producto' });
  }
};
export const deleteStockProducto = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    await service.deleteStockProducto(id);
    res.status(204).send();
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar stock producto' });
  }
};
