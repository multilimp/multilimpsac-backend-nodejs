import { Application, Request, Response } from 'express';
import { healthCheck } from './routes/health';
import ubigeoRoutes from './modules/ubigeo/ubigeo.routes';
import clientRoutes from './modules/client/client.routes';
import providerRoutes from './modules/provider/provider.routes';
import providerBalanceRoutes from './modules/providerBalance/providerBalance.routes';
import bankAccountRoutes from './modules/bankAccount/bankAccount.routes';
import companyRoutes from './modules/company/company.routes';
import transportRoutes from './modules/transport/transport.routes';
import fileRoutes from './modules/file/file.routes';
import contactRoutes from './entities/contact/contact.routes';
import catalogRoutes from './modules/catalog/catalog.routes';
import userRoutes from './modules/user/user.routes';
import authRoutes from './modules/auth/auth.routes';
import almacenRoutes from './modules/almacen/almacen.routes';
import cotizacionRoutes from './modules/cotizacion/cotizacion.routes';
import ordenCompraRoutes from './modules/ordenCompra/ordenCompra.routes';
import productoRoutes from './modules/producto/producto.routes';
import agrupacionOrdenCompraRoutes from './modules/agrupacionOrdenCompra/agrupacionOrdenCompra.routes';
import ventasRoutes from './features/ventas/ventas.routes';
import ordenProveedorRoutes from './features/ordenProveedor/ordenProveedor.routes';
import opProductoRoutes from './features/ordenProveedor/opProducto.routes';
import facturacionRoutes from './modules/facturacion/facturacion.routes';
import printRoutes from './features/print/print.routes';
import cobranzaRoutes, { gestionRoutes } from './features/cobranza/cobranza.routes';
import cobranzaFieldsRoutes from './modules/cobranza/cobranza.routes';
import gestionCobranzaRoutes from './modules/gestionCobranza/gestionCobranza.routes';
import tesoreriaRoutes from './features/tesoreria/tesoreria.routes';
import { authenticateToken } from './shared/middleware/auth.middleware';
// import { setupGraphQLRoutes } from './graphql/graphql.routes';
import pagoOrdenCompraPrivadaRoutes from './modules/pagoOrdenCompraPrivada/pagoOrdenCompraPrivada.routes';
import pagoOrdenProveedorRoutes from './modules/pagoOrdenProveedor/pagoOrdenProveedor.routes';
import pagoTransporteAsignadoRoutes from './modules/pagoTransporteAsignado/pagoTransporteAsignado.routes';
import paymentsRoutes from './modules/payments/payments.routes';
import chatbotRoutes from './modules/chatbot/chatbot.routes';
import reportesRoutes from './features/reportes/reportes.routes';

export const configureRoutes = async (app: Application): Promise<void> => {
  app.get('/api', (req: Request, res: Response) => res.json({ message: 'BACKEND MULTILIMP SAC' }));

  // Health check endpoint (sin autenticación)
  app.get('/api/health', healthCheck);

  // Reportes HTML público (temporal para testing)
  app.use('/api/reportes-public', reportesRoutes);

  app.use('/api/auth', authRoutes);
  // Configurar GraphQL como una ruta más
  // const graphqlMiddleware = await setupGraphQLRoutes();
  // Aplicar middleware personalizado para simplificar respuestas GraphQL
  //app.use('/graphqlk', express.json(), cors(), simplifyResponseMiddleware, graphqlMiddleware);


  app.use(authenticateToken);

  app.use('/api/ubigeo', ubigeoRoutes);
  app.use('/api/transports', transportRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/clients', clientRoutes);
  app.use('/api/providers', providerRoutes);
  app.use('/api/provider-balance', providerBalanceRoutes);
  app.use('/api/bank-accounts', bankAccountRoutes);
  app.use('/api/contacts', contactRoutes);
  app.use('/api/companies', companyRoutes);
  app.use('/api/catalogs', catalogRoutes);
  app.use('/api/almacenes', almacenRoutes);
  app.use('/api/cotizaciones', cotizacionRoutes);
  app.use('/api/ordenes-compra', ordenCompraRoutes);
  app.use('/api/ordenes-proveedores', ordenProveedorRoutes);
  app.use('/api/op-productos', opProductoRoutes);
  app.use('/api/productos', productoRoutes);
  app.use('/api/agrupaciones-oc', agrupacionOrdenCompraRoutes);
  app.use('/api/ventas', ventasRoutes);
  app.use('/api/facturacion/', facturacionRoutes);
  app.use('/api/print', printRoutes);
  app.use('/api/orden-compra', cobranzaRoutes);
  app.use('/api/orden-compra', cobranzaFieldsRoutes);  // Nuevas rutas para campos de cobranza
  app.use('/api/gestiones-cobranza', gestionCobranzaRoutes);  // CRUD de gestiones
  app.use('/api', gestionRoutes);
  app.use('/api/tesoreria', tesoreriaRoutes);
  app.use('/api/files', fileRoutes);

  // Reportes
  app.use('/api/reportes', reportesRoutes);

  // Pagos
  app.use('/api/pagos-orden-compra-privada', pagoOrdenCompraPrivadaRoutes);
  app.use('/api/pagos-orden-proveedor', pagoOrdenProveedorRoutes);
  app.use('/api/pagos-transporte-asignado', pagoTransporteAsignadoRoutes);

  // Controlador unificado de pagos
  app.use('/api/payments', paymentsRoutes);

  // Chatbot/Asistente Virtual
  app.use('/api/chatbot', chatbotRoutes);

  // Middleware para rutas no encontradas
  app.use((req: Request, res: Response) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
  });
};
