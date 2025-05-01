import { Request, Response } from 'express';
import * as service from './transporteAsignado.service';
import { handleError } from '../../shared/middleware/handleError';
export const listTransporteAsignado = async (req: Request, res: Response) => {
  try {
    const items = await service.getAllTransporteAsignado();
    res.status(200).json(items);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar transportes asignados' });
  }
};
export const getTransporteAsignado = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const item = await service.getTransporteAsignadoById(id);
    if (!item) return res.status(404).json({ message: 'No encontrado' });
    res.status(200).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener transporte asignado' });
  }
};
export const createTransporteAsignado = async (req: Request, res: Response) => {
  try {
    const item = await service.createTransporteAsignado(req.body);
    res.status(201).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear transporte asignado' });
  }
};
export const updateTransporteAsignado = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const item = await service.updateTransporteAsignado(id, req.body);
    res.status(200).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar transporte asignado' });
  }
};
export const deleteTransporteAsignado = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    await service.deleteTransporteAsignado(id);
    res.status(204).send();
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar transporte asignado' });
  }
};
