import { Request, Response } from 'express';
import { facturacionService } from './facturacion.service'; // Importar el objeto del servicio
import { handleError } from '../../shared/middleware/handleError';
import { CreateFacturacionData, UpdateFacturacionData } from './facturacion.service';

export const handleCreateOrUpdateFacturacion = async (req: Request, res: Response) => {
  try {
    const ordenCompraIdParam = req.params.ordenCompraId;
    const ordenCompraId = parseInt(ordenCompraIdParam, 10);

    if (isNaN(ordenCompraId)) {
      return res.status(400).json({ success: false, message: 'El parámetro ordenCompraId debe ser un número.' });
    }

    // El resto de los datos vienen del cuerpo
    const data = req.body as Omit<CreateFacturacionData | UpdateFacturacionData, 'ordenCompraId'>;
    
    // Pasamos ordenCompraId y el resto de los datos al servicio
    const facturacion = await facturacionService.createOrUpdateFacturacion({ ...data, ordenCompraId });
    res.status(201).json({ success: true, data: facturacion });
  } catch (err) {
    handleError({ res, error: err, msg: 'Error al crear o actualizar la facturación.' });
  }
};

export const handleGetFacturacionById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'El ID debe ser un número.' });
    }
    const facturacion = await facturacionService.getFacturacionById(id);
    if (!facturacion) {
      return res.status(404).json({ success: false, message: 'Facturación no encontrada.' });
    }
    res.status(200).json({ success: true, data: facturacion });
  } catch (err) {
    handleError({ res, error: err, msg: 'Error al obtener la facturación por ID.' });
  }
};

export const handleGetFacturacionByOrdenCompraId = async (req: Request, res: Response) => {
  try {
    const ordenCompraId = parseInt(req.params.ordenCompraId, 10);
    if (isNaN(ordenCompraId)) {
      return res.status(400).json({ success: false, message: 'El ordenCompraId debe ser un número.' });
    }
    const facturacion = await facturacionService.getFacturacionByOrdenCompraId(ordenCompraId);
    if (!facturacion) {
      return res.status(404).json({ success: false, message: 'Facturación no encontrada para la orden de compra especificada.' });
    }
    res.status(200).json({ success: true, data: facturacion });
  } catch (err) {
    handleError({ res, error: err, msg: 'Error al obtener la facturación por ID de orden de compra.' });
  }
};
