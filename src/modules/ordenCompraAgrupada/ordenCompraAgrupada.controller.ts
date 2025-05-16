import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError';
import * as service from './ordenCompraAgrupada.service';

export const listOrdenCompraAgrupada = async (req: Request, res: Response) => {
  try {
    const items = await service.getAllOrdenCompraAgrupada();
    res.status(200).json(items);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar ordenes compra agrupadas' });
  }
};

export const getOrdenCompraAgrupada = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const item = await service.getOrdenCompraAgrupadaById(id);
    if (!item) return res.status(404).json({ message: 'No encontrado' });
    res.status(200).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener orden compra agrupada' });
  }
};

export const createOrdenCompraAgrupada = async (req: Request, res: Response) => {
  try {
    const item = await service.createOrdenCompraAgrupada(req.body);
    res.status(201).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear orden compra agrupada' });
  }
};

export const updateOrdenCompraAgrupada = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const item = await service.updateOrdenCompraAgrupada(id, req.body);
    res.status(200).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar orden compra agrupada' });
  }
};

export const deleteOrdenCompraAgrupada = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    await service.deleteOrdenCompraAgrupada(id);
    res.status(204).send();
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar orden compra agrupada' });
  }
};
