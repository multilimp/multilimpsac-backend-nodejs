import dotenv from 'dotenv';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import logger from './config/logger';
import userRoutes from '@/modules/user/user.routes';

dotenv.config();

class Server {
  public app: Application;
  private readonly puerto: string | number;

  constructor() {
    this.puerto = process.env.PORT || 5000;
    this.app = express();

    this.middlewares();
    // this.conectarBD(); // Eliminado
    this.rutas();
    this.manejoErroresGlobal();
  }

  iniciarServidor() {
    this.app.listen(this.puerto, () => {
      logger.info(`Servidor corriendo en el puerto ${this.puerto}`);
    });
  }

  middlewares() {
    this.app.use(helmet()); // Añade cabeceras de seguridad
    this.app.use(cors()); // Permite solicitudes de origen cruzado
    this.app.use(express.json()); // Parsea bodies JSON
    this.app.use(express.urlencoded({ extended: false })); // Parsea bodies URL-encoded
    // Middleware para logging de solicitudes (opcional pero útil)
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      logger.info(`${req.method} ${req.url}`);
      next();
    });
  }

  rutas() {
    // Corregir el error de tipo dejando que TS infiera los tipos
    this.app.get('/', (req, res) => res.json({ message: 'BACKEND TS' }));
    this.app.use('/api/users', userRoutes);
    // Ruta 404 - Debe ir después de todas las demás rutas
    this.app.use((req, res) => { // Dejar que TS infiera req y res aquí también
      res.status(404).json({ message: 'Ruta no encontrada' });
    });
  }

  manejoErroresGlobal() {
    // Dejar que TS infiera los tipos aquí también puede ayudar
    this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      logger.error(`Error no controlado: ${err.message}`, { stack: err.stack });
      // Considera usar tu helper handleError aquí si quieres estandarizar respuestas de error
      res.status(500).json({ message: 'Error interno del servidor' });
    });
  }
}

export default Server;
