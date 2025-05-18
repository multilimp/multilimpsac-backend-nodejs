import Server from "./src/app";
import logger from "./src/shared/config/logger";

const iniciarAplicacion = async () => {
  try {
    const servidor = new Server();
    await servidor.iniciarServidor();
  } catch (error) {
    logger.error(`Error al iniciar la aplicación: ${(error as Error).message}`);
    process.exit(1);
  }
};

iniciarAplicacion();
