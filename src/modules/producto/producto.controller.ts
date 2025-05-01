import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError';
import * as productoService from './producto.service';

export const listProductos = async (req: Request, res: Response) => {
  try {
    const productos = await productoService.getAllProductos();
    res.status(200).json(productos);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar productos' });
  }
};

export const createProducto = async (req: Request, res: Response) => {
  try {
    const newProducto = await productoService.createProducto(req.body);
    res.status(201).json(newProducto);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear producto' });
  }
};

export const getProducto = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.productoId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de producto inválido' });
    }
    const producto = await productoService.getProductoById(id);
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json(producto);
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener producto' });
  }
};

export const updateProducto = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.productoId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de producto inválido' });
    }
    const updatedProducto = await productoService.updateProducto(id, req.body);
    res.status(200).json(updatedProducto);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar producto' });
  }
};

export const deleteProducto = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.productoId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de producto inválido' });
    }
    await productoService.deleteProducto(id);
    res.status(204).send();
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar producto' });
  }
};
