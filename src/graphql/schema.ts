import fs from 'fs';
import path from 'path';
import { ordenCompraResolvers } from './resolvers/ordenCompra.resolver';
import { jsonScalar } from './resolvers/scalar.resolver';
import logger from '../shared/config/logger';

/**
 * Carga y combina los archivos GraphQL
 */
const cargarEsquemas = () => {
  try {    // Rutas de los archivos GraphQL
    const schemaBase = path.join(__dirname, 'schemas', 'schema.graphql');
    const ordenCompraTypes = path.join(__dirname, 'schemas', 'OrdenCompraType.graphql');
    const entidadesTypes = path.join(__dirname, 'schemas', 'EntidadesType.graphql');
    const scalarTypes = path.join(__dirname, 'schemas', 'ScalarTypes.graphql');
    
    // Validar cada archivo individualmente para mejorar el manejo de errores
    const archivos = [
      { nombre: 'ScalarTypes.graphql', ruta: scalarTypes },
      { nombre: 'schema.graphql', ruta: schemaBase },
      { nombre: 'OrdenCompraType.graphql', ruta: ordenCompraTypes },
      { nombre: 'EntidadesType.graphql', ruta: entidadesTypes }
    ];
    
    let contenidoCombinado = '';
    
    // Procesar cada archivo
    for (const archivo of archivos) {
      if (fs.existsSync(archivo.ruta)) {        try {          const contenido = fs.readFileSync(archivo.ruta, 'utf8');
          logger.debug(`Cargando archivo GraphQL: ${archivo.nombre}`);
          
          // En GraphQL solo están permitidos los comentarios con #, no con //
          contenidoCombinado += contenido + '\n';
          logger.debug(`Archivo ${archivo.nombre} procesado correctamente`);
        } catch (fileError: any) {
          logger.error(`Error al leer el archivo ${archivo.nombre}:`, fileError);
          throw new Error(`Error al leer el archivo ${archivo.nombre}: ${fileError.message}`);
        }
      } else {
        logger.warn(`Advertencia: No se encontró el archivo ${archivo.nombre}`);
      }
    }
    
    if (contenidoCombinado.trim() === '') {
      logger.error('No se encontró contenido en los esquemas GraphQL');
      throw new Error('No se encontró contenido válido en los archivos de esquema GraphQL');
    }
      logger.info('Esquemas GraphQL cargados correctamente');
    
    // Verificar la presencia de comentarios JavaScript en el esquema final
    if (contenidoCombinado.includes('//')) {
      logger.warn('ADVERTENCIA: Se detectaron comentarios de estilo JavaScript (//) en los esquemas GraphQL.');
      logger.warn('Los archivos GraphQL solo admiten comentarios con #. Por favor revisar los archivos.');
    }
    
    return contenidoCombinado;
  } catch (error: any) {
    logger.error('Error cargando esquemas GraphQL:', error);
    throw new Error(`Error al cargar esquemas GraphQL: ${error.message}`);
  }
};

// Exportar los typeDefs combinados
export const typeDefs = cargarEsquemas();

// Exportar los resolvers combinados
export const resolvers = {
  // Añadir resolver personalizado para el tipo escalar JSON
  JSON: jsonScalar,
  
  Query: {
    healthCheck: () => 'GraphQL API está funcionando',
    ...ordenCompraResolvers.Query,
  },
};