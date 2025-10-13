import { Router } from 'express';
import {
    getProviderFinancialData,
    getTransportFinancialData,
    createProviderSaldo,
    createTransportSaldo,
    updateProviderSaldo,
    updateTransportSaldo,
    deleteTransportSaldo,
    deleteProviderSaldo
} from './saldos.controller';

const router = Router();

// Rutas para información financiera
router.get('/providers/:providerId/financial-data', getProviderFinancialData);
router.get('/transports/:transportId/financial-data', getTransportFinancialData);

// Rutas para crear saldos
router.post('/providers/:providerId/saldos', createProviderSaldo);
router.post('/transports/:transportId/saldos', createTransportSaldo);

// Rutas para gestionar saldos de proveedores
router.put('/saldos/:saldoId', updateProviderSaldo);
router.delete('/saldos/:saldoId', deleteProviderSaldo);

// Rutas para gestionar saldos de transporte
router.put('/transport-saldos/:saldoId', updateTransportSaldo);
router.delete('/transport-saldos/:saldoId', deleteTransportSaldo);

export default router;
