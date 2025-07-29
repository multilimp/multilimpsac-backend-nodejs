import { Request, Response } from 'express';
import {
  getOpProductosByOrdenProveedorId,
  getOpProductoById,
  createOpProducto,
  updateOpProducto,
  deleteOpProducto,
  updateMultipleOpProductos,
} from './opProducto.service';

export const getOpProductosByOrdenProveedor = async (req: Request, res: Response) => {
  try {
    const { ordenProveedorId } = req.params;
    const opProductos = await getOpProductosByOrdenProveedorId(Number(ordenProveedorId));
    
    res.status(200).json({
      success: true,
      data: opProductos,
    });
  } catch (error) {
    console.error('Error getting OP productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos de la OP',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getOpProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const opProducto = await getOpProductoById(Number(id));
    
    if (!opProducto) {
      return res.status(404).json({
        success: false,
        message: 'Producto de OP no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: opProducto,
    });
  } catch (error) {
    console.error('Error getting OP producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener producto de la OP',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const createOpProductoController = async (req: Request, res: Response) => {
  try {
    const opProducto = await createOpProducto(req.body);
    
    res.status(201).json({
      success: true,
      data: opProducto,
      message: 'Producto de OP creado exitosamente',
    });
  } catch (error) {
    console.error('Error creating OP producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear producto de la OP',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateOpProductoController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const opProducto = await updateOpProducto(Number(id), req.body);
    
    res.status(200).json({
      success: true,
      data: opProducto,
      message: 'Producto de OP actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error updating OP producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar producto de la OP',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteOpProductoController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteOpProducto(Number(id));
    
    res.status(200).json({
      success: true,
      message: 'Producto de OP eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error deleting OP producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar producto de la OP',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateMultipleOpProductosController = async (req: Request, res: Response) => {
  try {
    const { ordenProveedorId } = req.params;
    const { productos } = req.body;
    
    if (!Array.isArray(productos)) {
      return res.status(400).json({
        success: false,
        message: 'Los productos deben ser un array',
      });
    }

    const updatedProductos = await updateMultipleOpProductos(Number(ordenProveedorId), productos);
    
    res.status(200).json({
      success: true,
      data: updatedProductos,
      message: 'Productos de OP actualizados exitosamente',
    });
  } catch (error) {
    console.error('Error updating multiple OP productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar productos de la OP',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
