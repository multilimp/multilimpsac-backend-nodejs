import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError';
import * as ventasService from './ventas.service';
import { AnalyzePdfResult, GeminiService, GeminiServiceException } from '../../shared/services/gemini.service';
import formidable from 'formidable';
import logger from '../../shared/config/logger';
import { parseUTCDate } from '@/shared/utils/dateHelpers';

export const listVentas = async (req: Request, res: Response) => {
  try {
    const result = await ventasService.getAllVentas();

    // Obtener usuario de la request (agregado por middleware de auth)
    const user = (req as any).user;

    // Si el usuario tiene permiso JEFECOBRANZAS, mostrar todas las ventas
    if (user?.permisos?.includes('jefecobranzas')) {
      res.status(200).json(result);
      return;
    }

    // Para otros usuarios, aplicar filtrado normal (si existe)
    // Por ahora, devolver todas las ventas para mantener compatibilidad
    res.status(200).json(result);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar las ventas' });
  }
};

export const getVenta = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.ventaId, 10);
    if (isNaN(id)) throw new Error('NOT_FOUND');

    const venta = await ventasService.getVentaById(id);
    if (!venta) throw new Error('NOT_FOUND');

    res.status(200).json(venta);
  } catch (error) {
    handleError({ res, statusCode: 404, error });
  }
};


export const createVenta = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (data.fechaForm) data.fechaForm = parseUTCDate(data.fechaForm) || undefined;
    if (data.fechaMaxForm) data.fechaMaxForm = parseUTCDate(data.fechaMaxForm) || undefined;
    if (data.fechaSiaf) data.fechaSiaf = parseUTCDate(data.fechaSiaf) || undefined;
    if (data.fechaEntrega) data.fechaEntrega = parseUTCDate(data.fechaEntrega) || undefined;

    if (data.ventaPrivada && data.ventaPrivada.fechaPago) {
      data.ventaPrivada.fechaPago = parseUTCDate(data.ventaPrivada.fechaPago) || undefined;
    }
    if (data.ventaPrivada && data.ventaPrivada.fechaFactura) {
      const parsed = parseUTCDate(data.ventaPrivada.fechaFactura) || undefined;
      if (parsed) {
        parsed.setDate(parsed.getDate() + 1);
        data.ventaPrivada.fechaFactura = parsed;
      } else {
        data.ventaPrivada.fechaFactura = undefined;
      }
    }
    if (data.ventaPrivada && Array.isArray(data.ventaPrivada.pagos)) {
      data.ventaPrivada.pagos = data.ventaPrivada.pagos.map((p: any) => ({
        ...p,
        fechaPago: p.fechaPago ? (parseUTCDate(p.fechaPago) || undefined) : undefined,
      }));
    }
    const nuevaVenta = await ventasService.createVenta(data);
    res.status(201).json(nuevaVenta);

  } catch (error) {
    handleError({ res, error, msg: 'Error al crear la venta' });
  }
};


export const updateVenta = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.ventaId, 10);
    const data = req.body;
    if (isNaN(id)) throw new Error('NOT_FOUND');
    if (data.fechaForm) data.fechaForm = parseUTCDate(data.fechaForm) || undefined;
    if (data.fechaMaxForm) data.fechaMaxForm = parseUTCDate(data.fechaMaxForm) || undefined;
    if (data.fechaSiaf) data.fechaSiaf = parseUTCDate(data.fechaSiaf) || undefined;
    if (data.fechaEntrega) data.fechaEntrega = parseUTCDate(data.fechaEntrega) || undefined;

    if (data.ventaPrivada && data.ventaPrivada.fechaPago) {
      data.ventaPrivada.fechaPago = parseUTCDate(data.ventaPrivada.fechaPago) || undefined;
    }
    if (data.ventaPrivada && data.ventaPrivada.fechaFactura) {
      const parsed = parseUTCDate(data.ventaPrivada.fechaFactura) || undefined;
      if (parsed) {
        parsed.setDate(parsed.getDate() + 1);
        data.ventaPrivada.fechaFactura = parsed;
      } else {
        data.ventaPrivada.fechaFactura = undefined;
      }
    }
    if (data.ventaPrivada && Array.isArray(data.ventaPrivada.pagos)) {
      data.ventaPrivada.pagos = data.ventaPrivada.pagos.map((p: any) => ({
        ...p,
        fechaPago: p.fechaPago ? (parseUTCDate(p.fechaPago) || undefined) : undefined,
      }));
    }
    const updated = await ventasService.updateVenta(id, data);
    res.status(200).json(updated);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar la venta' });
  }
};

export const patchVenta = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.ventaId, 10);
    const data = req.body;
    if (isNaN(id)) throw new Error('NOT_FOUND');

    const updated = await ventasService.patchVenta(id, data);
    res.status(200).json(updated);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar parcialmente la venta' });
  }
};

export const deleteVenta = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.ventaId, 10);
    if (isNaN(id)) throw new Error('NOT_FOUND');

    const inactivated = await ventasService.deleteVenta(id);
    res.status(200).json(inactivated);
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar la venta' });
  }
};

export const analyzePdfForVenta = async (req: Request, res: Response) => {
  const form = formidable({
    maxFileSize: 10 * 1024 * 1024, // Límite de 10MB para el PDF
    keepExtensions: true,
  });

  try {
    const [, files] = await form.parse(req);

    const pdfFile = files.pdfFile?.[0]; // Asumiendo que el campo del formulario se llama 'pdfFile'

    if (!pdfFile) {
      logger.warn('No PDF file uploaded or field name is not "pdfFile".');
      return res.status(400).json({ message: 'No PDF file uploaded. Please use the "pdfFile" field.' });
    }

    if (pdfFile.mimetype !== 'application/pdf') {
      logger.warn(`Invalid file type uploaded: ${pdfFile.mimetype}`);
      return res.status(400).json({ message: 'Invalid file type. Only PDF files are allowed.' });
    }

    const geminiService = new GeminiService();
    const analysisResult: AnalyzePdfResult = await geminiService.analyzePdf(pdfFile as formidable.File);

    if (analysisResult.success) {
      // Subir el archivo a R2 después del análisis exitoso
      const { uploadFile } = await import('../../modules/file/file.service');
      const fileUrl = await uploadFile(pdfFile as formidable.File, 'documentos-oce');

      // Agregar la URL del archivo al resultado
      const responseData = {
        ...analysisResult.data,
        documentoOceUrl: fileUrl
      };

      res.status(200).json(responseData);
    } else {
      logger.error('Analysis failed but no exception caught from GeminiService, result:', analysisResult);
      res.status(500).json({ message: analysisResult.error || 'Error during PDF analysis with Gemini.' });
    }
  } catch (error: any) {
    if (error instanceof GeminiServiceException) {
      logger.error(`GeminiServiceException in controller: ${error.message}`, { statusCode: error.statusCode, originalError: error.originalError });
      handleError({ res, error, statusCode: error.statusCode, msg: error.message });
    } else if (error.message && (error.message.includes('no files uploaded') || error.message.includes('maxFileSize exceeded'))) {
      logger.warn(`Formidable parsing error: ${error.message}`);
      handleError({ res, error, statusCode: 400, msg: `File upload error: ${error.message}` });
    }
    else {
      logger.error('Unexpected error processing PDF analysis request:', error);
      handleError({ res, error, msg: 'Error processing PDF analysis request.' });
    }
  }
};

export const addOrdenCompraPrivada = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const nuevaOrdenPrivada = await ventasService.createOrdenCompraPrivada(data);
    res.status(201).json(nuevaOrdenPrivada);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear la orden de compra privada' });
  }
};

export const calcularPromedioCobranza = async (req: Request, res: Response) => {
  try {
    const clienteId = parseInt(req.params.clienteId, 10);
    if (isNaN(clienteId)) throw new Error('NOT_FOUND');

    const promedio = await ventasService.calcularPromedioCobranzaCliente(clienteId);
    res.status(200).json({
      clienteId,
      promedioCobranzaDias: promedio
    });
  } catch (error) {
    handleError({ res, error, msg: 'Error al calcular promedio de cobranza' });
  }
};

export const updatePromedioCobranza = async (req: Request, res: Response) => {
  try {
    const clienteId = parseInt(req.params.clienteId, 10);
    const { promedioCobranza } = req.body;
    if (isNaN(clienteId)) throw new Error('NOT_FOUND');
    if (typeof promedioCobranza !== 'number' || promedioCobranza < 0) {
      throw new Error('INVALID_DATA');
    }

    await ventasService.updatePromedioCobranzaCliente(clienteId, promedioCobranza);
    res.status(200).json({
      clienteId,
      promedioCobranza
    });
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar promedio de cobranza' });
  }
};
