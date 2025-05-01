import { Router } from 'express';
import * as ctrl from './gestionCobranza.controller';
const router = Router();
router.get('/', ctrl.listGestionCobranza);
router.get('/:id', ctrl.getGestionCobranza);
router.post('/', ctrl.createGestionCobranza);
router.put('/:id', ctrl.updateGestionCobranza);
router.delete('/:id', ctrl.deleteGestionCobranza);
export default router;
