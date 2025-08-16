import { Router } from 'express';
import { uploadProfilePhoto } from './upload.controller';
import { upload } from './upload.service';
import { authenticateToken } from '../../shared/middleware/auth.middleware';

const router = Router();

// Ruta para subir foto de perfil
router.post('/profile/:userId', authenticateToken, upload.single('photo'), uploadProfilePhoto);

export default router;
