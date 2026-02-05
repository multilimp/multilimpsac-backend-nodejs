import { Router } from 'express';
import {
    getVentasReportHandler,
    getEntregasReportHandler,
    getCobranzaReportHandler,
    getRankingReportHandler,
    getUtilidadReportHandler,
} from './reports.controller';

const router = Router();

// GET /reports/ventas?year=2024&mesInicio=1&mesFin=12&filtroRango=mayor-5k
router.get('/ventas', getVentasReportHandler);

// GET /reports/entregas?year=2024&mesInicio=1&mesFin=12
router.get('/entregas', getEntregasReportHandler);

// GET /reports/cobranza?year=2024&etapas=COM,PAG,GIR
router.get('/cobranza', getCobranzaReportHandler);

// GET /reports/ranking?year=2024&mes=1&region=LIMA
router.get('/ranking', getRankingReportHandler);

// GET /reports/utilidad?year=2024&mesInicio=1&mesFin=12&empresaId=1
router.get('/utilidad', getUtilidadReportHandler);

export default router;
