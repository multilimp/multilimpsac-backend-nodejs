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
