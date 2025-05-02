import dotenv from 'dotenv';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import logger from './src/shared/config/logger';

// routes
import ubigeoRoutes from './src/modules/ubigeo/ubigeo.routes';
import clientRoutes from './src/modules/client/client.routes';
import providerRoutes from './src/modules/provider/provider.routes';
import providerBalanceRoutes from './src/modules/providerBalance/providerBalance.routes';
import bankAccountRoutes from './src/modules/bankAccount/bankAccount.routes';
import companyRoutes from './src/modules/company/company.routes';
import transportRoutes from './src/modules/transport/transport.routes';
import fileRoutes from './src/modules/file/file.routes';
import contactRoutes from './src/modules/contact/contact.routes';
import catalogRoutes from './src/modules/catalog/catalog.routes';
import userRoutes from './src/modules/user/user.routes';
import almacenRoutes from './src/modules/almacen/almacen.routes';
import cotizacionRoutes from './src/modules/cotizacion/cotizacion.routes';
import ordenCompraRoutes from './src/modules/ordenCompra/ordenCompra.routes';
import ordenProveedorRoutes from './src/modules/ordenProveedor/ordenProveedor.routes';
import productoRoutes from './src/modules/producto/producto.routes';
import agrupacionOrdenCompraRoutes from './src/modules/agrupacionOrdenCompra/agrupacionOrdenCompra.routes';

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
    this.app.get('/api', (req, res) => res.json({ message: 'BACKEND MULTILIMP SAC' }));

    this.app.use('/api/ubigeo', ubigeoRoutes);
    // this.app.use('/api/users', userRoutes);
    this.app.use('/api/clients', clientRoutes);
    this.app.use('/api/providers', providerRoutes);
    this.app.use('/api/provider-balance', providerBalanceRoutes);
    this.app.use('/api/bank-accounts', bankAccountRoutes);
    this.app.use('/api/companies', companyRoutes);
    this.app.use('/api/transports', transportRoutes);
    this.app.use('/api/files', fileRoutes);
    this.app.use('/api/contacts', contactRoutes);
    this.app.use('/api/catalogs', catalogRoutes);
    this.app.use('/api/almacenes', almacenRoutes);
    this.app.use('/api/cotizaciones', cotizacionRoutes);
    this.app.use('/api/ordenes-compra', ordenCompraRoutes);
    this.app.use('/api/ordenes-proveedor', ordenProveedorRoutes);
    this.app.use('/api/productos', productoRoutes);
    this.app.use('/api/agrupaciones-oc', agrupacionOrdenCompraRoutes);

    // Ruta 404 - Debe ir después de todas las demás rutas
    this.app.use((req: Request, res: Response) => {
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
