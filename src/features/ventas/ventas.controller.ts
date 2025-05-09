import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError';
import * as ventasService from './ventas.service';
import { AnalyzePdfResult, GeminiService, GeminiServiceException } from '../../shared/services/gemini.service';
import formidable from 'formidable';
import logger from '../../shared/config/logger';

export const listVentas = async (req: Request, res: Response) => {
  try {
    const page     = Number(req.query.page)     || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const filters  = {
      clienteId: req.query.clienteId ? Number(req.query.clienteId) : undefined,
      minPrice:  req.query.minPrice  ? Number(req.query.minPrice)  : undefined,
      maxPrice:  req.query.maxPrice  ? Number(req.query.maxPrice)  : undefined,
      fechaFrom: req.query.fechaFrom as string,
      fechaTo:   req.query.fechaTo   as string,
      search:    req.query.search    as string
    };

    const result = await ventasService.getAllVentas(page, pageSize, filters);
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

    const nuevaVenta = await ventasService.createVenta(data);
    res.status(201).json(nuevaVenta);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear la venta' });
  }
};


export const updateVenta = async (req: Request, res: Response) => {
  try {
    const id   = parseInt(req.params.ventaId, 10);
    const data = req.body;
    if (isNaN(id)) throw new Error('NOT_FOUND');

    const updated = await ventasService.updateVenta(id, data);
    res.status(200).json(updated);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar la venta' });
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
      res.status(200).json(analysisResult.data); // Devuelve directamente analysisResult.data
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
