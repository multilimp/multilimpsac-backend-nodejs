import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError';
import * as ordenProveedorService from './ordenProveedor.service';

export const listOrdenesProveedor = async (req: Request, res: Response) => {
  try {
    const ordenes = await ordenProveedorService.getAllOrdenesProveedor();
    res.status(200).json(ordenes);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar órdenes de proveedor' });
  }
};

export const createOrdenProveedor = async (req: Request, res: Response) => {
  try {
    const newOrden = await ordenProveedorService.createOrdenProveedor(req.body);
    res.status(201).json(newOrden);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear orden de proveedor' });
  }
};

export const getOrdenProveedor = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.ordenProveedorId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de orden de proveedor inválido' });
    }
    const orden = await ordenProveedorService.getOrdenProveedorById(id);
    if (!orden) {
      return res.status(404).json({ message: 'Orden de proveedor no encontrada' });
    }
    res.status(200).json(orden);
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener orden de proveedor' });
  }
};

export const updateOrdenProveedor = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.ordenProveedorId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de orden de proveedor inválido' });
    }
    const updatedOrden = await ordenProveedorService.updateOrdenProveedor(id, req.body);
    res.status(200).json(updatedOrden);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar orden de proveedor' });
  }
};

export const deleteOrdenProveedor = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.ordenProveedorId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de orden de proveedor inválido' });
    }
    await ordenProveedorService.deleteOrdenProveedor(id);
    res.status(204).send();
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar orden de proveedor' });
  }
};
