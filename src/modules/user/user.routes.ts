import { Router } from 'express';
// Usar imports nombrados si se usa 'export const' en el controller
import { createUser, deleteUser, listUsers, updateUser, getUser } from './user.controller';
import { authenticateToken } from '../../shared/middleware/auth.middleware';
import { registerUser } from '../auth/auth.service';

const router = Router();

router.get('', listUsers);
router.get('/:userId', getUser);
// router.post('', registerUser);
router.put('/:userId', updateUser);
router.delete('/:userId', deleteUser);

export default router;
