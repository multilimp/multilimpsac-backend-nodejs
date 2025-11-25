import 'dotenv/config'
import Server from "./src/app"
import logger from "./src/shared/config/logger"

const iniciarAplicacion = async () => {
  try {
    logger.info('🚀 Iniciando MULTILIMP ERP...');

    const servidor = new Server();
    await servidor.iniciarServidor();

    logger.info('✅ MULTILIMP ERP iniciado exitosamente');
  } catch (error) {
    logger.error(`❌ Error fatal al iniciar MULTILIMP ERP: ${(error as Error).message}`);
    process.exit(1);
  }
};

// Manejo de señales para shutdown graceful
process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido. Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT recibido. Cerrando servidor...');
  process.exit(0);
});

iniciarAplicacion();
