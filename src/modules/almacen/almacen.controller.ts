import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError';
import * as almacenService from './almacen.service';

export const listAlmacenes = async (req: Request, res: Response) => {
  try {
    const almacenes = await almacenService.getAllAlmacenes();
    res.status(200).json(almacenes);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar almacenes' });
  }
};

export const createAlmacen = async (req: Request, res: Response) => {
  try {
    const newAlmacen = await almacenService.createAlmacen(req.body);
    res.status(201).json(newAlmacen);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear almacén' });
  }
};

export const getAlmacen = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.almacenId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de almacén inválido' });
    }
    const almacen = await almacenService.getAlmacenById(id);
    if (!almacen) {
      return res.status(404).json({ message: 'Almacén no encontrado' });
    }
    res.status(200).json(almacen);
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener almacén' });
  }
};

export const updateAlmacen = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.almacenId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de almacén inválido' });
    }
    const updatedAlmacen = await almacenService.updateAlmacen(id, req.body);
    res.status(200).json(updatedAlmacen);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar almacén' });
  }
};

export const deleteAlmacen = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.almacenId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de almacén inválido' });
    }
    await almacenService.deleteAlmacen(id);
    res.status(204).send();
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar almacén' });
  }
};
