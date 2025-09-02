import { Request, Response } from 'express';
import { generateCargosEntregaReport, generateCargosEntregaHtml } from './reportes.service';
import { handleError } from '../../shared/middleware/handleError';

export const getCargosEntregaReport = async (req: Request, res: Response) => {
    try {
        const { fechaInicio, fechaFin } = req.query;

        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren fechaInicio y fechaFin como parámetros de consulta'
            });
        }

        const pdfBuffer = await generateCargosEntregaReport(
            new Date(fechaInicio as string),
            new Date(fechaFin as string)
        );

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="cargos-entrega-${fechaInicio}-${fechaFin}.pdf"`);
        res.send(pdfBuffer);

    } catch (error) {
        handleError({ res, error, msg: 'Error al generar el reporte de cargos de entrega' });
    }
};

export const getCargosEntregaHtml = async (req: Request, res: Response) => {
    try {
        const { fechaInicio, fechaFin } = req.query;

        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren fechaInicio y fechaFin como parámetros de consulta'
            });
        }

        const html = await generateCargosEntregaHtml(
            new Date(fechaInicio as string),
            new Date(fechaFin as string)
        );

        res.setHeader('Content-Type', 'text/html');
        res.send(html);

    } catch (error) {
        handleError({ res, error, msg: 'Error al generar la previsualización del reporte de cargos de entrega' });
    }
};
