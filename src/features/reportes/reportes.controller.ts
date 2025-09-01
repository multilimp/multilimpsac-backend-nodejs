import { Request, Response } from 'express';
import { generateCargosEntregaReport } from './reportes.service';
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
