import dotenv from 'dotenv';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import logger from './shared/config/logger';
import { configureRoutes } from './router';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import fs from 'fs';
import path from 'path';
import { ordenCompraResolvers } from './graphql/resolvers/ordenCompra.resolver'; // Ajusta la ruta

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
    this.setupGraphQL(); // Añadir la configuración de GraphQL
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

  private setupGraphQL() {
    try {
      const schemaString = fs.readFileSync(path.join(__dirname, './graphql/OrdenCompraType.graphql'), 'utf8');
      const schema = buildSchema(schemaString);

      // Combina los resolvers. Si tienes más resolvers, puedes combinarlos aquí.
      const rootValue = {
        ...ordenCompraResolvers.Query,
        // Si tienes Mutations u otros tipos raíz, añádelos aquí
        // Ejemplo: ...ordenCompraResolvers.Mutation,
        // OrdenCompra: ordenCompraResolvers.OrdenCompra, // Si tienes resolvers a nivel de campo para OrdenCompra
      };

      this.app.use('/graphql', graphqlHTTP({
        schema: schema,
        rootValue: rootValue, // Usar rootValue para pasar los resolvers
        graphiql: process.env.NODE_ENV !== 'production', // Habilitar GraphiQL en desarrollo
        customFormatErrorFn: (error) => { // Opcional: formato de error personalizado
          logger.error('GraphQL Error:', error);
          return {
            message: error.message,
            locations: error.locations,
            path: error.path,
            extensions: error.extensions,
          };
        }
      }));
      logger.info('GraphQL endpoint configurado en /graphql');
    } catch (error) {
      logger.error('Error al configurar GraphQL:', error);
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
