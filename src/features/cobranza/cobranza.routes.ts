import { Router } from 'express';
import { 
  handleUpdateCobranza, 
  handleGetGestionesCobranza,
  handleCreateGestionCobranza,
  handleUpdateGestionCobranza,
  handleDeleteGestionCobranza
} from './cobranza.controller';

const cobranzaRoutes = Router();

// Rutas para cobranza general
cobranzaRoutes.post('/:ordenCompraId/cobranzas', handleUpdateCobranza);
cobranzaRoutes.get('/:ordenCompraId/cobranzas', handleGetGestionesCobranza);

// Rutas para gestiones individuales
cobranzaRoutes.post('/:ordenCompraId/cobranzas/gestion', handleCreateGestionCobranza);

// Rutas independientes para gestiones (usando un router separado sería mejor, pero así es más simple)
const gestionRoutes = Router();
gestionRoutes.put('/gestion-cobranza/:gestionId', handleUpdateGestionCobranza);
gestionRoutes.delete('/gestion-cobranza/:gestionId', handleDeleteGestionCobranza);

export default cobranzaRoutes;
export { gestionRoutes };
