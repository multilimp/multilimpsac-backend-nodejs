import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError';
import * as ordenCompraService from './ordenCompra.service';

export const listOrdenesCompra = async (req: Request, res: Response) => {
  try {
    const ordenes = await ordenCompraService.getAllOrdenesCompra();
    res.status(200).json(ordenes);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar órdenes de compra' });
  }
};

export const createOrdenCompra = async (req: Request, res: Response) => {
  try {
    // Podría generar código único aquí si no se proporciona
    // if (!req.body.codigoVenta && req.body.empresaId) {
    //   req.body.codigoVenta = await ordenCompraService.generateUniqueOrdenCompraCode(req.body.empresaId);
    // }
    const newOrden = await ordenCompraService.createOrdenCompra(req.body);
    res.status(201).json(newOrden);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear orden de compra' });
  }
};

export const getOrdenCompra = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.ordenCompraId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de orden de compra inválido' });
    }
    const orden = await ordenCompraService.getOrdenCompraById(id);
    if (!orden) {
      return res.status(404).json({ message: 'Orden de compra no encontrada' });
    }
    res.status(200).json(orden);
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener orden de compra' });
  }
};

export const updateOrdenCompra = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.ordenCompraId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de orden de compra inválido' });
    }
    const updatedOrden = await ordenCompraService.updateOrdenCompra(id, req.body);
    res.status(200).json(updatedOrden);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar orden de compra' });
  }
};

export const patchOrdenCompra = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.ordenCompraId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de orden de compra inválido' });
    }
    const updatedOrden = await ordenCompraService.patchOrdenCompra(id, req.body);
    res.status(200).json(updatedOrden);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar parcialmente orden de compra' });
  }
};

export const deleteOrdenCompra = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.ordenCompraId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de orden de compra inválido' });
    }
    const ordenInactiva = await ordenCompraService.deleteOrdenCompra(id);
    res.status(200).json(ordenInactiva);
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar orden de compra' });
  }
};

// Controlador para generar código único (opcional)
export const generateCode = async (req: Request, res: Response) => {
    try {
        const empresaId = parseInt(req.query.empresaId as string, 10);
        if (isNaN(empresaId)) {
            return res.status(400).json({ message: 'Se requiere un empresaId válido.' });
        }
        const code = await ordenCompraService.generateUniqueOrdenCompraCode(empresaId);
        res.status(200).json({ code });
    } catch (error) {
        handleError({ res, error, msg: 'Error al generar código único' });
    }
};
