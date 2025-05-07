import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError';
import * as authService from './auth.service';

export const register = async (req: Request, res: Response) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    handleError({ res, error, msg: 'Error al registrar usuario' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginUser(req.body);
    if (!result) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    res.status(200).json(result);
  } catch (error) {
    handleError({ res, error, msg: 'Error al iniciar sesión' });
  }
};

export const validateToken = async (req: Request, res: Response) => {
  try {
    // Si el middleware authenticateToken pasa, el token es válido.
    // El middleware ya añade la información del usuario decodificado a req.user.
    // Devolvemos la información del usuario para confirmar la validación.
    // Asegúrate de que la interfaz `Request` de Express esté extendida para incluir `user`
    // o usa un tipo más específico para `req` si es necesario.
    const user = (req as any).user;
    res.status(200).json({ message: 'Token válido', user });
  } catch (error) {
    // Aunque authenticateToken debería atrapar tokens inválidos,
    // es bueno tener un manejo de errores aquí también.
    handleError({ res, error, msg: 'Error al validar token' });
  }
};
