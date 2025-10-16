import dotenv from 'dotenv';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import logger from './shared/config/logger';
import { config } from './shared/config/env';
import { configureRoutes } from './router';

dotenv.config();

class Server {
  public app: Application;
  private readonly puerto: string | number;
  private readonly url: string; constructor() {
    this.puerto = config.port;
    this.url = process.env.URL ?? 'http://localhost';
    this.app = express();

    this.middlewares();
    this.inicializarRutas();
    this.manejoErroresGlobal();
  }
  async iniciarServidor() {
    try {
      this.app.listen(this.puerto, () => {
        logger.info(`Servidor escuchando en ${this.url}:${this.puerto}`);
      });
    } catch (error) {
      logger.error(`Error al iniciar el servidor: ${(error as Error).message}`);
      process.exit(1);
    }
  }

  middlewares() {
    this.app.use(helmet());

    const corsOptions = {
      origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://multilimpsac.vercel.app',
        'https://multilimpsac-nodejs.onrender.com',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    };

    this.app.use(cors(corsOptions));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));

    // Servir archivos estáticos
    this.app.use('/uploads', express.static('uploads'));

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      logger.info(`${req.method} ${req.url}`);
      next();
    });
  }
  async inicializarRutas() {
    try {
      await configureRoutes(this.app);
      logger.info('Todas las rutas configuradas correctamente');
    } catch (error) {
      logger.error(`Error al configurar las rutas: ${(error as Error).message}`);
    }
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
