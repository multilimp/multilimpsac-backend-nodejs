import { Usuario } from '../../prisma/generated/client';

declare global {
  namespace Express {
    interface Request {
      user?: Usuario;
    }
  }
}

export {};
