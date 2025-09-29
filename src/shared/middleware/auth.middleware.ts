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

/**
 * Middleware para verificar permisos específicos
 * @param requiredPermissions - Array de permisos requeridos
 * @param requireAll - Si es true, el usuario debe tener TODOS los permisos; si es false, al menos uno
 */
export const requirePermissions = (requiredPermissions: string[], requireAll: boolean = false) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.permisos) {
      return res.status(403).json({ message: 'Usuario no autenticado o sin permisos.' });
    }

    const userPermissions = req.user.permisos;

    if (requireAll) {
      // El usuario debe tener TODOS los permisos requeridos
      const hasAllPermissions = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        return res.status(403).json({
          message: 'No tienes permisos suficientes para realizar esta acción.',
          requiredPermissions,
          userPermissions
        });
      }
    } else {
      // El usuario debe tener AL MENOS uno de los permisos requeridos
      const hasAnyPermission = requiredPermissions.some(permission =>
        userPermissions.includes(permission)
      );

      if (!hasAnyPermission) {
        return res.status(403).json({
          message: 'No tienes permisos suficientes para realizar esta acción.',
          requiredPermissions,
          userPermissions
        });
      }
    }

    next();
  };
};

/**
 * Middleware específico para verificar permiso de jefe de cobranzas
 */
export const requireJefeCobranzas = requirePermissions(['jefecobranzas'], false);

/**
 * Middleware para validar asignación de cobrador (solo jefe de cobranzas)
 * Verifica si se está intentando asignar un cobrador y requiere permisos especiales
 */
export const requireJefeCobranzasForCobradorAssignment = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Si el body incluye cobradorId, requiere permiso de jefe de cobranzas
  if (req.body && (req.body.cobradorId !== undefined || req.body.cobradorId !== null)) {
    if (!req.user || !req.user.permisos) {
      return res.status(403).json({ message: 'Usuario no autenticado o sin permisos.' });
    }

    const userPermissions = req.user.permisos;
    const hasJefeCobranzasPermission = userPermissions.includes('jefecobranzas');

    if (!hasJefeCobranzasPermission) {
      return res.status(403).json({
        message: 'Solo usuarios con permiso de jefe de cobranzas pueden asignar cobradores.',
        requiredPermission: 'jefecobranzas',
        userPermissions
      });
    }
  }

  next();
};
