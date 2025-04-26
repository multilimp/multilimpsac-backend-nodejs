import { Router } from 'express';
// Usar imports nombrados si se usa 'export const' en el controller
import { createUser, deleteUser, listUsers, updateUser, getUser } from './user.controller';
// O importar todo el módulo: import * as userController from './user.controller';

// Opcional: Añadir middleware de validación si se crea
// import { validateCreateUser, validateUpdateUser } from './user.validation'; // Necesitaría crear este archivo

const router = Router();

router.get('', listUsers); // userController.listUsers si se usa import *
router.get('/:userId', getUser); // Nueva ruta para obtener por ID
// Añadir middleware de validación antes del controlador
// router.post('', validateCreateUser, createUser);
router.post('', createUser);
// router.put('/:userId', validateUpdateUser, updateUser);
router.put('/:userId', updateUser);
router.delete('/:userId', deleteUser);

export default router;
