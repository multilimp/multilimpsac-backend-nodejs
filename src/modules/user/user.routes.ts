import { Router } from 'express';
// Usar imports nombrados si se usa 'export const' en el controller
import { createUser, deleteUser, listUsers, updateUser, updateUserWithImage, getUser, changeUserPassword, adminChangeUserPassword, updateUserProfile, deactivateUser, activateUser } from './user.controller';
import { authenticateToken } from '../../shared/middleware/auth.middleware';
import { registerUser } from '../auth/auth.service';

const router = Router();

router.get('', listUsers);
router.get('/:userId', getUser);
router.post('', createUser);
router.put('/:userId', updateUser);
router.put('/:userId/with-image', updateUserWithImage);
router.put('/:userId/profile', updateUserProfile);
router.put('/:userId/password', changeUserPassword);
router.put('/:userId/admin-change-password', adminChangeUserPassword);
router.delete('/:userId', deleteUser);

// ✅ NUEVO: Rutas para soft delete
router.patch('/:userId/deactivate', deactivateUser);
router.patch('/:userId/activate', activateUser);

export default router;
