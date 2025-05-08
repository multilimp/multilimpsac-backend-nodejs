import dotenv from 'dotenv';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import logger from './shared/config/logger';

import ubigeoRoutes from './modules/ubigeo/ubigeo.routes';
import clientRoutes from './modules/client/client.routes';
import providerRoutes from './modules/provider/provider.routes';
import providerBalanceRoutes from './modules/providerBalance/providerBalance.routes';
import bankAccountRoutes from './modules/bankAccount/bankAccount.routes';
import companyRoutes from './modules/company/company.routes';
import transportRoutes from './modules/transport/transport.routes';
import fileRoutes from './modules/file/file.routes';
import contactRoutes from './modules/contact/contact.routes';
import catalogRoutes from './modules/catalog/catalog.routes';
import userRoutes from './modules/user/user.routes';
import authRoutes from './modules/auth/auth.routes';
import almacenRoutes from './modules/almacen/almacen.routes';
import cotizacionRoutes from './modules/cotizacion/cotizacion.routes';
import ordenCompraRoutes from './modules/ordenCompra/ordenCompra.routes';
import ordenProveedorRoutes from './modules/ordenProveedor/ordenProveedor.routes';
import productoRoutes from './modules/producto/producto.routes';
import agrupacionOrdenCompraRoutes from './modules/agrupacionOrdenCompra/agrupacionOrdenCompra.routes';
import { authenticateToken } from './shared/middleware/auth.middleware';

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
// ...existing code...
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      logger.info(`${req.method} ${req.url}`);
      next();
    });
  }

  rutas() {
    this.app.get('/api', (req, res) => res.json({ message: 'BACKEND MULTILIMP SAC' }));

    this.app.use('/api/auth', authRoutes);

    this.app.use(authenticateToken);

    this.app.use('/api/ubigeo', ubigeoRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/clients', clientRoutes);
    this.app.use('/api/providers', providerRoutes);
    this.app.use('/api/provider-balance', providerBalanceRoutes);
    this.app.use('/api/bank-accounts', bankAccountRoutes);
    this.app.use('/api/companies', companyRoutes);
// ...existing code...
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

    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ message: 'Ruta no encontrada' });
    });
  }

  manejoErroresGlobal() {
    this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      logger.error(`Error no controlado: ${err.message}`, { stack: err.stack });
      res.status(500).json({ message: 'Error interno del servidor' });
    });
  }
}

export default Server;
