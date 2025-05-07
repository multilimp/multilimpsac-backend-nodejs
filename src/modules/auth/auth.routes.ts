import { Router } from 'express';
import * as authController from './auth.controller';
import { authenticateToken } from '../../shared/middleware/auth.middleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/validate-token', authenticateToken, authController.validateToken);

export default router;
