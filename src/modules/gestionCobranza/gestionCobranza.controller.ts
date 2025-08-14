import { Request, Response } from 'express';
import * as service from './gestionCobranza.service';
import { handleError } from '../../shared/middleware/handleError';

/**
 * Lista todas las gestiones de cobranza
 */
export const listGestionCobranza = async (req: Request, res: Response) => {
  try {
    const items = await service.getAllGestionCobranza();
    res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar gestiones cobranza' });
  }
};

/**
 * Lista las gestiones de cobranza por orden de compra
 */
export const listGestionCobranzaByOrdenCompra = async (req: Request, res: Response) => {
  try {
    const ordenCompraId = parseInt(req.params.ordenCompraId, 10);
    if (isNaN(ordenCompraId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de orden de compra inválido' 
      });
    }

    const items = await service.getGestionCobranzaByOrdenCompra(ordenCompraId);
    res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar gestiones de cobranza por orden de compra' });
  }
};

/**
 * Obtiene una gestión de cobranza por ID
 */
export const getGestionCobranza = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID inválido' 
      });
    }

    const item = await service.getGestionCobranzaById(id);
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Gestión de cobranza no encontrada' 
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener gestion cobranza' });
  }
};

/**
 * Crea una nueva gestión de cobranza
 */
export const createGestionCobranza = async (req: Request, res: Response) => {
  try {
    // Validar campos requeridos
    const { ordenCompraId, fechaGestion, notaGestion, estadoCobranza, tipoCobranza } = req.body;
    
    if (!ordenCompraId || !fechaGestion || !notaGestion || !estadoCobranza || !tipoCobranza) {
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos: ordenCompraId, fechaGestion, notaGestion, estadoCobranza, tipoCobranza'
      });
    }

    const item = await service.createGestionCobranza(req.body);
    res.status(201).json({
      success: true,
      message: 'Gestión de cobranza creada exitosamente',
      data: item
    });
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear gestion cobranza' });
  }
};

/**
 * Actualiza una gestión de cobranza
 */
export const updateGestionCobranza = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID inválido' 
      });
    }

    const item = await service.updateGestionCobranza(id, req.body);
    res.status(200).json({
      success: true,
      message: 'Gestión de cobranza actualizada exitosamente',
      data: item
    });
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar gestion cobranza' });
  }
};

/**
 * Elimina una gestión de cobranza
 */
export const deleteGestionCobranza = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID inválido' 
      });
    }

    await service.deleteGestionCobranza(id);
    res.status(200).json({
      success: true,
      message: 'Gestión de cobranza eliminada exitosamente'
    });
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar gestion cobranza' });
  }
};
