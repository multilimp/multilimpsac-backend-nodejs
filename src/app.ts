import dotenv from 'dotenv';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import logger from './shared/config/logger';
import { configureRoutes } from './router';

dotenv.config();

class Server {
  public app: Application;
  private readonly puerto: string | number;
  private readonly url: string;

  constructor() {
    this.puerto = process.env.PORT ?? 5000;
    this.url = process.env.URL ?? 'http://localhost';
    this.app = express();

    this.middlewares();
    this.rutas();
    this.manejoErroresGlobal();
  }

  iniciarServidor() {
    this.app.listen(this.puerto, () => {
      logger.info(`Servidor escuchando en ${this.url}:${this.puerto}`);
    });
  }

  middlewares() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      logger.info(`${req.method} ${req.url}`);
      next();
    });
  }

  rutas() {
    configureRoutes(this.app);
  }

  manejoErroresGlobal() {
    this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      logger.error(`Error no controlado: ${err.message}`, { stack: err.stack });
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error interno del servidor' });
      }
    });
  }
}

export default Server;
