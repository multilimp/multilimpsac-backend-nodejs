import { Request, Response } from 'express';
import * as service from './pagoOrdenCompraPrivada.service';
import { handleError } from '../../shared/middleware/handleError';
export const listPagoOrdenCompraPrivada = async (req: Request, res: Response) => {
  try {
    const items = await service.getAllPagoOrdenCompraPrivada();
    res.status(200).json(items);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar pagos orden compra privada' });
  }
};
export const getPagoOrdenCompraPrivada = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const item = await service.getPagoOrdenCompraPrivadaById(id);
    if (!item) return res.status(404).json({ message: 'No encontrado' });
    res.status(200).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener pago orden compra privada' });
  }
};
export const createPagoOrdenCompraPrivada = async (req: Request, res: Response) => {
  try {
    const item = await service.createPagoOrdenCompraPrivada(req.body);
    res.status(201).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear pago orden compra privada' });
  }
};
export const updatePagoOrdenCompraPrivada = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const item = await service.updatePagoOrdenCompraPrivada(id, req.body);
    res.status(200).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar pago orden compra privada' });
  }
};
export const deletePagoOrdenCompraPrivada = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    await service.deletePagoOrdenCompraPrivada(id);
    res.status(204).send();
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar pago orden compra privada' });
  }
};
