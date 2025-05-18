import { Router } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs, resolvers } from './schema';
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../shared/config/env';
import logger from '../shared/config/logger';
import path from 'path';
import prisma from '../database/prisma';

const router = Router();

// Configuración y exportación del middleware de Apollo Server
export const setupGraphQLRoutes = async () => {  // Crear un nuevo servidor Apollo
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true, // Permite introspección en desarrollo
    formatError: (formattedError, error) => {
      // Log de errores para debugging
      logger.error(`GraphQL Error: ${formattedError.message}`, {
        path: formattedError.path,
        error: error instanceof Error ? error.stack : undefined
      });
      
      // En producción, podrías querer ocultar detalles de errores internos
      const isProduction = process.env.NODE_ENV === 'production';
      
      if (isProduction && formattedError.extensions?.code === 'INTERNAL_SERVER_ERROR') {
        return {
          message: 'Ha ocurrido un error interno.',
          path: formattedError.path
        };
      }
      
      return formattedError;
    }
  });

  // Iniciar el servidor Apollo
  await apolloServer.start();
    // Configurar el middleware de Apollo Server
  return expressMiddleware(apolloServer, {
    context: async ({ req }) => {
      // Usar el mismo esquema de autenticación que el resto de la aplicación
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1] || '';
      
      if (!token) {
        return { user: null };
      }
      
      try {
        // Usar la misma lógica de verificación de token que en auth.middleware.ts
        const decoded = jwt.verify(token, config.jwt.secret) as { userId: number; email: string };
        
        // Buscar el usuario en la base de datos para obtener información adicional
        // Esto es opcional, pero útil para tener datos completos del usuario
        let userData = null;
        //
        //try {
        //  const user = await prisma.user.findUnique({
        //    where: { id: decoded.userId },
        //    select: {
        //      id: true,
        //      email: true,
        //      username: true,
        //      role: true,
        //      active: true
        //    }
        //  });
        //  
        //  if (user && user.active) {
        //    userData = user;
        //  }
        //} catch (dbError) {
        //  logger.error(`Error buscando usuario para GraphQL: ${(dbError as Error).message}`);
        //  // Si hay error en la BD, continuamos con los datos decodificados del token
        //}
        
        return { 
          user: userData || decoded,
          token 
        };
      } catch (error) {
        logger.debug(`Token inválido en GraphQL: ${(error as Error).message}`);
        return { user: null };
        // No lanzamos error para permitir operaciones públicas
      }
    },
  });
};

export default router;
