import { Request, Response } from 'express';
import { cobranzaService } from './cobranza.service';
import { handleError } from '../../shared/middleware/handleError';

export const handleUpdateCobranza = async (req: Request, res: Response) => {
  try {
    const ordenCompraId = parseInt(req.params.ordenCompraId, 10);
    
    if (isNaN(ordenCompraId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de orden de compra inválido.' 
      });
    }

    const result = await cobranzaService.updateCobranza(ordenCompraId, req.body);

    res.status(200).json({
      success: true,
      message: 'Información de cobranza actualizada exitosamente.',
      data: result
    });
    
  } catch (error) {
    handleError({ 
      res, 
      error, 
      msg: 'Error al actualizar la información de cobranza.' 
    });
  }
};

export const handleGetGestionesCobranza = async (req: Request, res: Response) => {
  try {
    const ordenCompraId = parseInt(req.params.ordenCompraId, 10);
    
    if (isNaN(ordenCompraId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de orden de compra inválido.' 
      });
    }

    const gestiones = await cobranzaService.getGestionesByOrdenCompraId(ordenCompraId);
    
    res.status(200).json({
      success: true,
      data: gestiones
    });
    
  } catch (error) {
    handleError({ 
      res, 
      error, 
      msg: 'Error al obtener las gestiones de cobranza.' 
    });
  }
};

export const handleCreateGestionCobranza = async (req: Request, res: Response) => {
  try {
    const ordenCompraId = parseInt(req.params.ordenCompraId, 10);
    
    if (isNaN(ordenCompraId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de orden de compra inválido.' 
      });
    }

    const gestion = await cobranzaService.createGestion(ordenCompraId, req.body);

    res.status(201).json({
      success: true,
      message: 'Gestión de cobranza creada exitosamente.',
      data: gestion
    });
    
  } catch (error) {
    handleError({ 
      res, 
      error, 
      msg: 'Error al crear la gestión de cobranza.' 
    });
  }
};

export const handleUpdateGestionCobranza = async (req: Request, res: Response) => {
  try {
    const gestionId = parseInt(req.params.gestionId, 10);
    
    if (isNaN(gestionId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de gestión inválido.' 
      });
    }

    const gestion = await cobranzaService.updateGestion(gestionId, req.body);

    res.status(200).json({
      success: true,
      message: 'Gestión de cobranza actualizada exitosamente.',
      data: gestion
    });
    
  } catch (error) {
    handleError({ 
      res, 
      error, 
      msg: 'Error al actualizar la gestión de cobranza.' 
    });
  }
};

export const handleDeleteGestionCobranza = async (req: Request, res: Response) => {
  try {
    const gestionId = parseInt(req.params.gestionId, 10);
    
    if (isNaN(gestionId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de gestión inválido.' 
      });
    }

    await cobranzaService.deleteGestion(gestionId);

    res.status(200).json({
      success: true,
      message: 'Gestión de cobranza eliminada exitosamente.'
    });
    
  } catch (error) {
    handleError({ 
      res, 
      error, 
      msg: 'Error al eliminar la gestión de cobranza.' 
    });
  }
};
