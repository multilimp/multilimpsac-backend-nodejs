import { Request, Response } from 'express';
import * as service from './cotizacionProducto.service';
import { handleError } from '../../shared/middleware/handleError';

export const listCotizacionProductos = async (req: Request, res: Response) => {
  try {
    const items = await service.getAllCotizacionProductos();
    res.status(200).json(items);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar cotizacion productos' });
  }
};

export const getCotizacionProducto = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const item = await service.getCotizacionProductoById(id);
    if (!item) return res.status(404).json({ message: 'No encontrado' });
    res.status(200).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener cotizacion producto' });
  }
};

export const createCotizacionProducto = async (req: Request, res: Response) => {
  try {
    const item = await service.createCotizacionProducto(req.body);
    res.status(201).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear cotizacion producto' });
  }
};

export const updateCotizacionProducto = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const item = await service.updateCotizacionProducto(id, req.body);
    res.status(200).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar cotizacion producto' });
  }
};

export const deleteCotizacionProducto = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    await service.deleteCotizacionProducto(id);
    res.status(204).send();
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar cotizacion producto' });
  }
};
