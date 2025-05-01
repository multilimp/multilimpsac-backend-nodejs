import { Request, Response } from 'express';
import * as service from './opProducto.service';
import { handleError } from '../../shared/middleware/handleError';
export const listOpProducto = async (req: Request, res: Response) => {
  try {
    const items = await service.getAllOpProducto();
    res.status(200).json(items);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar productos orden proveedor' });
  }
};
export const getOpProducto = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const item = await service.getOpProductoById(id);
    if (!item) return res.status(404).json({ message: 'No encontrado' });
    res.status(200).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener producto orden proveedor' });
  }
};
export const createOpProducto = async (req: Request, res: Response) => {
  try {
    const item = await service.createOpProducto(req.body);
    res.status(201).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear producto orden proveedor' });
  }
};
export const updateOpProducto = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const item = await service.updateOpProducto(id, req.body);
    res.status(200).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar producto orden proveedor' });
  }
};
export const deleteOpProducto = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    await service.deleteOpProducto(id);
    res.status(204).send();
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar producto orden proveedor' });
  }
};
