import { Router } from 'express';
import { handleUpdateCobranza, handleGetGestionesCobranza } from './cobranza.controller';

const cobranzaRoutes = Router();

cobranzaRoutes.post('/:ordenCompraId/cobranzas', handleUpdateCobranza);
cobranzaRoutes.get('/:ordenCompraId/cobranzas', handleGetGestionesCobranza);

export default cobranzaRoutes;
