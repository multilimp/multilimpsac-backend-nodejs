import { Router } from 'express';
import {
    getProviderFinancialData,
    getTransportFinancialData,
    createProviderSaldo,
    createTransportSaldo,
    updateSaldo,
    deleteSaldo,
    updateTransportSaldo,
    deleteTransportSaldo
} from './saldos.controller';

const router = Router();

// Rutas para información financiera
router.get('/providers/:providerId/financial-data', getProviderFinancialData);
router.get('/transports/:transportId/financial-data', getTransportFinancialData);

// Rutas para crear saldos
router.post('/providers/:providerId/saldos', createProviderSaldo);
router.post('/transports/:transportId/saldos', createTransportSaldo);

// Rutas para gestionar saldos
router.put('/saldos/:saldoId', updateSaldo);
router.delete('/saldos/:saldoId', deleteSaldo);

// Rutas para gestionar saldos de transporte
router.put('/transport-saldos/:saldoId', updateTransportSaldo);
router.delete('/transport-saldos/:saldoId', deleteTransportSaldo);

export default router;
