import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError';
import * as almacenService from './almacen.service';

// ============ ALMACENES ============
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

// ============ PRODUCTOS ============
export const listProductos = async (req: Request, res: Response) => {
  try {
    const productos = await almacenService.getAllProductos();
    res.status(200).json(productos);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar productos' });
  }
};

export const createProducto = async (req: Request, res: Response) => {
  try {
    const newProducto = await almacenService.createProducto(req.body);
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
    const producto = await almacenService.getProductoById(id);
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
    const updatedProducto = await almacenService.updateProducto(id, req.body);
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
    await almacenService.deleteProducto(id);
    res.status(204).send();
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar producto' });
  }
};

// ============ STOCK ============
export const listStock = async (req: Request, res: Response) => {
  try {
    const stock = await almacenService.getAllStock();
    res.status(200).json(stock);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar stock' });
  }
};

export const getStockByAlmacen = async (req: Request, res: Response) => {
  try {
    const almacenId = parseInt(req.params.almacenId, 10);
    if (isNaN(almacenId)) {
      return res.status(400).json({ message: 'ID de almacén inválido' });
    }
    const stock = await almacenService.getStockByAlmacen(almacenId);
    res.status(200).json(stock);
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener stock del almacén' });
  }
};

export const getStockByProducto = async (req: Request, res: Response) => {
  try {
    const productoId = parseInt(req.params.productoId, 10);
    if (isNaN(productoId)) {
      return res.status(400).json({ message: 'ID de producto inválido' });
    }
    const stock = await almacenService.getStockByProducto(productoId);
    res.status(200).json(stock);
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener stock del producto' });
  }
};

export const createOrUpdateStock = async (req: Request, res: Response) => {
  try {
    const { productoId, almacenId, cantidad } = req.body;

    if (!productoId || !almacenId || cantidad === undefined) {
      return res.status(400).json({
        message: 'Producto ID, Almacén ID y cantidad son requeridos'
      });
    }

    const stock = await almacenService.createOrUpdateStock({
      productoId: parseInt(productoId, 10),
      almacenId: parseInt(almacenId, 10),
      cantidad: parseInt(cantidad, 10)
    });

    res.status(200).json(stock);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear/actualizar stock' });
  }
};

export const updateStock = async (req: Request, res: Response) => {
  try {
    const productoId = parseInt(req.params.productoId, 10);
    const almacenId = parseInt(req.params.almacenId, 10);
    const { cantidad } = req.body;

    if (isNaN(productoId) || isNaN(almacenId) || cantidad === undefined) {
      return res.status(400).json({
        message: 'Producto ID, Almacén ID y cantidad son requeridos'
      });
    }

    const updatedStock = await almacenService.updateStock(productoId, almacenId, { cantidad });
    res.status(200).json(updatedStock);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar stock' });
  }
};

export const deleteStock = async (req: Request, res: Response) => {
  try {
    const productoId = parseInt(req.params.productoId, 10);
    const almacenId = parseInt(req.params.almacenId, 10);

    if (isNaN(productoId) || isNaN(almacenId)) {
      return res.status(400).json({
        message: 'Producto ID y Almacén ID son requeridos'
      });
    }

    await almacenService.deleteStock(productoId, almacenId);
    res.status(204).send();
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar stock' });
  }
};
