import { Request, Response } from 'express';
import * as service from './ordenCompraPrivada.service';
import { handleError } from '../../shared/middleware/handleError';
export const listOrdenCompraPrivada = async (req: Request, res: Response) => {
  try {
    const items = await service.getAllOrdenCompraPrivada();
    res.status(200).json(items);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar ordenes compra privadas' });
  }
};
export const getOrdenCompraPrivada = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const item = await service.getOrdenCompraPrivadaById(id);
    if (!item) return res.status(404).json({ message: 'No encontrado' });
    res.status(200).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener orden compra privada' });
  }
};
export const createOrdenCompraPrivada = async (req: Request, res: Response) => {
  try {
    const item = await service.createOrdenCompraPrivada(req.body);
    res.status(201).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear orden compra privada' });
  }
};
export const updateOrdenCompraPrivada = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const item = await service.updateOrdenCompraPrivada(id, req.body);
    res.status(200).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar orden compra privada' });
  }
};
export const deleteOrdenCompraPrivada = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    await service.deleteOrdenCompraPrivada(id);
    res.status(204).send();
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar orden compra privada' });
  }
};
