import { Request, Response } from 'express';
import * as service from './gestionCobranza.service';
import { handleError } from '../../shared/middleware/handleError';
export const listGestionCobranza = async (req: Request, res: Response) => {
  try {
    const items = await service.getAllGestionCobranza();
    res.status(200).json(items);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar gestiones cobranza' });
  }
};
export const getGestionCobranza = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const item = await service.getGestionCobranzaById(id);
    if (!item) return res.status(404).json({ message: 'No encontrado' });
    res.status(200).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener gestion cobranza' });
  }
};
export const createGestionCobranza = async (req: Request, res: Response) => {
  try {
    const item = await service.createGestionCobranza(req.body);
    res.status(201).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear gestion cobranza' });
  }
};
export const updateGestionCobranza = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const item = await service.updateGestionCobranza(id, req.body);
    res.status(200).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar gestion cobranza' });
  }
};
export const deleteGestionCobranza = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    await service.deleteGestionCobranza(id);
    res.status(204).send();
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar gestion cobranza' });
  }
};
