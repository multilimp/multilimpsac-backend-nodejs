import { Router } from 'express';
import {
    listArchivosAdjuntosByOrdenCompra,
    getArchivoAdjunto,
    createArchivoAdjunto,
    updateArchivoAdjunto,
    deleteArchivoAdjunto
} from './archivosAdjuntos.controller';
import { authenticateToken } from '../../shared/middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas para archivos adjuntos
router.get('/orden-compra/:ordenCompraId', listArchivosAdjuntosByOrdenCompra);
router.get('/:id', getArchivoAdjunto);
router.post('/', createArchivoAdjunto);
router.put('/:id', updateArchivoAdjunto);
router.delete('/:id', deleteArchivoAdjunto);

export default router;