import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError';
import * as cotizacionService from './cotizacion.service';

export const listCotizaciones = async (req: Request, res: Response) => {
  try {
    const cotizaciones = await cotizacionService.getAllCotizaciones();
    res.status(200).json(cotizaciones);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar cotizaciones' });
  }
};

export const createCotizacion = async (req: Request, res: Response) => {
  try {
    // Aquí iría validación más robusta con Zod
    const newCotizacion = await cotizacionService.createCotizacion(req.body);
    res.status(201).json(newCotizacion);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear cotización' });
  }
};

export const getCotizacion = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.cotizacionId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de cotización inválido' });
    }
    const cotizacion = await cotizacionService.getCotizacionById(id);
    if (!cotizacion) {
      return res.status(404).json({ message: 'Cotización no encontrada' });
    }
    res.status(200).json(cotizacion);
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener cotización' });
  }
};

export const updateCotizacion = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.cotizacionId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de cotización inválido' });
    }
    // Aquí iría validación más robusta con Zod
    const updatedCotizacion = await cotizacionService.updateCotizacion(id, req.body);
    res.status(200).json(updatedCotizacion);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar cotización' });
  }
};

export const deleteCotizacion = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.cotizacionId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de cotización inválido' });
    }
    await cotizacionService.deleteCotizacion(id);
    res.status(204).send();
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar cotización' });
  }
};
