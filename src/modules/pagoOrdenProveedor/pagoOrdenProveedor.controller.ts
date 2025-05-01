import { Request, Response } from 'express';
import * as service from './pagoOrdenProveedor.service';
import { handleError } from '../../shared/middleware/handleError';
export const listPagoOrdenProveedor = async (req: Request, res: Response) => {
  try {
    const items = await service.getAllPagoOrdenProveedor();
    res.status(200).json(items);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar pagos orden proveedor' });
  }
};
export const getPagoOrdenProveedor = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const item = await service.getPagoOrdenProveedorById(id);
    if (!item) return res.status(404).json({ message: 'No encontrado' });
    res.status(200).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener pago orden proveedor' });
  }
};
export const createPagoOrdenProveedor = async (req: Request, res: Response) => {
  try {
    const item = await service.createPagoOrdenProveedor(req.body);
    res.status(201).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear pago orden proveedor' });
  }
};
export const updatePagoOrdenProveedor = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const item = await service.updatePagoOrdenProveedor(id, req.body);
    res.status(200).json(item);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar pago orden proveedor' });
  }
};
export const deletePagoOrdenProveedor = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    await service.deletePagoOrdenProveedor(id);
    res.status(204).send();
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar pago orden proveedor' });
  }
};
