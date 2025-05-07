import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError'; // Ruta corregida
import * as userService from './user.service'; // Importar servicio

export const listUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar usuarios' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const newUser = await userService.createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear usuario' });
  }
};


export const getUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.userId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }
    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.status(200).json(user);
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener usuario' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.userId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }
    // Validación del body aquí
    const updatedUser = await userService.updateUser(id, req.body);
    res.status(200).json(updatedUser);
  } catch (error) {
    // Manejar error si el usuario no existe (Prisma puede lanzar error)
    handleError({ res, error, msg: 'Error al actualizar usuario' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.userId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }
    await userService.deleteUser(id);
    // Devolver 204 No Content es común para DELETE exitoso
    res.status(204).send();
  } catch (error) {
    // Manejar error si el usuario no existe
    handleError({ res, error, msg: 'Error al eliminar usuario' });
  }
};
