import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError';
import * as cobranzaService from './cobranza.service';

/**
 * Actualiza los campos específicos de cobranza de una orden de compra
 * Campos: etapaSiaf, fechaSiaf, penalidad, estadoCobranza, fechaEstadoCobranza
 */
export const updateCobranzaFields = async (req: Request, res: Response) => {
  try {
    const ordenCompraId = parseInt(req.params.ordenCompraId, 10);
    
    if (isNaN(ordenCompraId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de orden de compra inválido.' 
      });
    }

    // Validar que solo se envíen los campos permitidos
    const allowedFields = ['etapaSiaf', 'fechaSiaf', 'penalidad', 'estadoCobranza', 'fechaEstadoCobranza'];
    const receivedFields = Object.keys(req.body);
    const invalidFields = receivedFields.filter(field => !allowedFields.includes(field));
    
    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Campos no permitidos: ${invalidFields.join(', ')}`
      });
    }

    // Verificar que hay al menos un campo para actualizar
    if (receivedFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se enviaron campos para actualizar'
      });
    }

    const updatedCobranza = await cobranzaService.updateCobranzaFields(ordenCompraId, req.body);

    res.status(200).json({
      success: true,
      message: `Campos de cobranza actualizados: ${receivedFields.join(', ')}`,
      fieldsUpdated: receivedFields,
      data: updatedCobranza
    });
    
  } catch (error) {
    handleError({ 
      res, 
      error, 
      msg: 'Error al actualizar la información de cobranza.' 
    });
  }
};

/**
 * Obtiene la información de cobranza de una orden de compra
 */
export const getCobranzaByOrdenCompra = async (req: Request, res: Response) => {
  try {
    const ordenCompraId = parseInt(req.params.ordenCompraId, 10);
    
    if (isNaN(ordenCompraId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de orden de compra inválido.' 
      });
    }

    const cobranza = await cobranzaService.getCobranzaByOrdenCompra(ordenCompraId);

    if (!cobranza) {
      return res.status(404).json({
        success: false,
        message: 'Orden de compra no encontrada.'
      });
    }

    res.status(200).json({
      success: true,
      data: cobranza
    });
    
  } catch (error) {
    handleError({ 
      res, 
      error, 
      msg: 'Error al obtener la información de cobranza.' 
    });
  }
};
