import { Router } from 'express';
import * as cobranzaController from './cobranza.controller';

const router = Router();

// Rutas para gestión de campos de cobranza
router.patch('/:ordenCompraId/cobranza', cobranzaController.updateCobranzaFields);
router.get('/:ordenCompraId/cobranza', cobranzaController.getCobranzaByOrdenCompra);

export default router;
