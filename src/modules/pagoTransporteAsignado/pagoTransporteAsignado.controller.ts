import { Request, Response } from 'express';
import * as service from './pagoTransporteAsignado.service';
import { handleError } from '../../shared/middleware/handleError';
export const listPagoTransporteAsignado = async (req: Request, res: Response) => {
  try {
    const items = await service.getAllPagoTransporteAsignado();
    res.status(200).json(items);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar pagos transporte asignado' });
  }
};
export const getPagoTransporteAsignado = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const item = await service.getPagoTransporteAsignadoById(id);
    if (!item) return res.status(404).json({ message: 'No encontrado' });
    res.status(200).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener pago transporte asignado' });
  }
};
export const createPagoTransporteAsignado = async (req: Request, res: Response) => {
  try {
    const item = await service.createPagoTransporteAsignado(req.body);
    res.status(201).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear pago transporte asignado' });
  }
};
export const updatePagoTransporteAsignado = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const item = await service.updatePagoTransporteAsignado(id, req.body);
    res.status(200).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar pago transporte asignado' });
  }
};
export const deletePagoTransporteAsignado = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    await service.deletePagoTransporteAsignado(id);
    res.status(204).send();
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar pago transporte asignado' });
  }
};
