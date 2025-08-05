import { Request, Response } from 'express';
import { generateFacturaPDF, generateOrdenProveedorPDF } from './print.service';
import { handleError } from '../../shared/middleware/handleError';

export const generateFacturaPDFHandler = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID de factura inválido.' });
    }

    const pdfBuffer = await generateFacturaPDF(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="factura-${id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    handleError({ res, error, msg: 'Error al generar el PDF de la factura.' });
  }
};

export const generateOrdenProveedorPDFHandler = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID de orden de proveedor inválido.' });
    }

    const pdfBuffer = await generateOrdenProveedorPDF(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="orden-proveedor-${id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    handleError({ res, error, msg: 'Error al generar el PDF de la orden de proveedor.' });
  }
};
