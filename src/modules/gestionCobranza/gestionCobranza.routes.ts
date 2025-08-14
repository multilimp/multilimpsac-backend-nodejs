import { Router } from 'express';
import * as ctrl from './gestionCobranza.controller';

const router = Router();

// CRUD clásico para gestiones de cobranza
router.get('/', ctrl.listGestionCobranza);
router.get('/:id', ctrl.getGestionCobranza);
router.post('/', ctrl.createGestionCobranza);
router.put('/:id', ctrl.updateGestionCobranza);
router.delete('/:id', ctrl.deleteGestionCobranza);

// Ruta específica para obtener gestiones por orden de compra
router.get('/orden-compra/:ordenCompraId', ctrl.listGestionCobranzaByOrdenCompra);

export default router;
