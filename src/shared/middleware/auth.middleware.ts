import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import prisma from '../../database/prisma';

export interface AuthRequest extends Request {
  user?: any; // Define un tipo más específico para el usuario si es posible
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // Si no hay token, no autorizado

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: number; email: string }; // Especifica el tipo del payload decodificado
    // Opcional: Verificar si el usuario aún existe en la BD
    const user = await prisma.usuario.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(403).json({ message: 'Usuario no encontrado.' }); // Usuario del token ya no existe
    }
    req.user = user; // Añade el usuario decodificado al objeto request
    next(); // Pasa al siguiente middleware o controlador
  } catch (err) {
    return res.status(403).json({ message: 'Token inválido o expirado.' }); // Token no es válido
  }
};
