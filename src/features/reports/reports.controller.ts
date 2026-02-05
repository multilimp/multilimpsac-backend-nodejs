import { Request, Response } from 'express';
import {
    getVentasReportData,
    getEntregasReportData,
    getCobranzaReportData,
    getRankingReportData,
    getUtilidadReportData,
} from './reports.service';
import { handleError } from '../../shared/middleware/handleError';

// Validar parámetros comunes
const validateCommonParams = (year?: string, mesInicio?: string, mesFin?: string) => {
    const y = parseInt(year || String(new Date().getFullYear()), 10);
    const mi = parseInt(mesInicio || '1', 10);
    const mf = parseInt(mesFin || '12', 10);

    if (isNaN(y) || isNaN(mi) || isNaN(mf)) {
        return { valid: false, error: 'Parámetros numéricos inválidos' };
    }

    if (mi < 1 || mi > 12 || mf < 1 || mf > 12 || mi > mf) {
        return { valid: false, error: 'Meses inválidos (debe ser 1-12 y mesInicio <= mesFin)' };
    }

    return { valid: true, year: y, mesInicio: mi, mesFin: mf };
};

export const getVentasReportHandler = async (req: Request, res: Response) => {
    try {
        const { year, mesInicio, mesFin, filtroRango } = req.query;
        const validation = validateCommonParams(year as string, mesInicio as string, mesFin as string);

        if (!validation.valid) {
            return res.status(400).json({ success: false, message: validation.error });
        }

        const data = await getVentasReportData(validation.year!, validation.mesInicio!, validation.mesFin!, filtroRango as string | undefined);

        res.json({ success: true, data });
    } catch (error) {
        handleError({ res, error, msg: 'Error al obtener reporte de Ventas' });
    }
};

export const getEntregasReportHandler = async (req: Request, res: Response) => {
    try {
        const { year, mesInicio, mesFin } = req.query;
        const validation = validateCommonParams(year as string, mesInicio as string, mesFin as string);

        if (!validation.valid) {
            return res.status(400).json({ success: false, message: validation.error });
        }

        const data = await getEntregasReportData(validation.year!, validation.mesInicio!, validation.mesFin!);

        res.json({ success: true, data });
    } catch (error) {
        handleError({ res, error, msg: 'Error al obtener reporte de Entregas' });
    }
};

export const getCobranzaReportHandler = async (req: Request, res: Response) => {
    try {
        const { year, etapas } = req.query;
        const y = parseInt(year as string, 10) || new Date().getFullYear();

        if (isNaN(y)) {
            return res.status(400).json({ success: false, message: 'Año inválido' });
        }

        // etapas viene como string separado por comas o como array
        let etapasArray: string[] = [];
        if (etapas) {
            etapasArray = typeof etapas === 'string' ? etapas.split(',') : (etapas as string[]);
        }

        const data = await getCobranzaReportData(y, etapasArray);

        res.json({ success: true, data });
    } catch (error) {
        handleError({ res, error, msg: 'Error al obtener reporte de Cobranza' });
    }
};

export const getRankingReportHandler = async (req: Request, res: Response) => {
    try {
        const { year, mes, region } = req.query;
        const y = parseInt(year as string, 10) || new Date().getFullYear();
        const m = mes ? parseInt(mes as string, 10) : undefined;

        if (isNaN(y) || (m && (isNaN(m) || m < 1 || m > 12))) {
            return res.status(400).json({ success: false, message: 'Parámetros inválidos' });
        }

        const data = await getRankingReportData(y, m, region as string | undefined);

        res.json({ success: true, data });
    } catch (error) {
        handleError({ res, error, msg: 'Error al obtener reporte de Ranking' });
    }
};

export const getUtilidadReportHandler = async (req: Request, res: Response) => {
    try {
        const { year, mesInicio, mesFin, empresaId } = req.query;
        const validation = validateCommonParams(year as string, mesInicio as string, mesFin as string);

        if (!validation.valid) {
            return res.status(400).json({ success: false, message: validation.error });
        }

        const eid = empresaId ? parseInt(empresaId as string, 10) : undefined;

        const data = await getUtilidadReportData(
            validation.year!,
            validation.mesInicio!,
            validation.mesFin!,
            eid
        );

        res.json({ success: true, data });
    } catch (error) {
        handleError({ res, error, msg: 'Error al obtener reporte de Utilidad' });
    }
};
