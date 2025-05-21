// src/graphql/resolvers/ordenCompra.resolver.ts
import prisma from '../../database/prisma';
import { Prisma } from '@prisma/client';
import { GraphQLResolveInfo } from 'graphql';
import logger from '../../shared/config/logger';
import { getFields } from '../utils/resolverUtils';
import { createOptimizedQueryParams } from '../utils/prismaQueryBuilder';
import { manejarErrorGraphQL } from '../utils/errorHandling';


export const ordenCompraResolvers = {
  Query: {
    ordenCompra: async (_parent: any, args: { id: string }, context: any, info: GraphQLResolveInfo) => {
      logger.info(`GraphQL Resolver: ordenCompra - Solicitando orden con ID: ${args.id}`);
      
      /* Comentamos temporalmente la verificación de autenticación para pruebas
      if (!context.user) {
        logger.warn('GraphQL: Intento de acceso a ordenCompra sin autenticación');
        throw new Error('No autenticado');
      }
      */
      
      try {
        // Obtener los campos solicitados primero para analizar la consulta
        const fields = getFields(info);
        
        // Detectar si se solicitan relaciones específicas
        const includeCliente = fields?.cliente !== undefined;
        const includeEmpresa = fields?.empresa !== undefined;
        
        // Log para diagnóstico
        logger.debug(`Campos solicitados: ${JSON.stringify(fields)}`);
        logger.debug(`Se solicitan relaciones: Cliente=${includeCliente}, Empresa=${includeEmpresa}`);
        
        // Obtener parámetros optimizados para consulta usando la nueva función
        const queryOptions = createOptimizedQueryParams(info, 'OrdenCompra');
        logger.debug(`Parámetros de consulta optimizados: ${JSON.stringify(queryOptions)}`);
        
        // Consultar la orden de compra con selección optimizada de campos
        const ordenCompra = await prisma.ordenCompra.findUnique({
          where: { id: parseInt(args.id) },
          ...queryOptions,
        });
        
        if (!ordenCompra) {
          logger.warn(`GraphQL: Orden de compra con ID ${args.id} no encontrada`);
          throw new Error(`Orden de compra con ID ${args.id} no encontrada`);
        }
        
        // Log para diagnóstico
        // Usamos sintaxis de acceso de índice para evitar errores de TypeScript con propiedades dinámicas
        const tieneCliente = 'cliente' in ordenCompra ? !!ordenCompra['cliente'] : 'N/A';
        const tieneEmpresa = 'empresa' in ordenCompra ? !!ordenCompra['empresa'] : 'N/A';
        logger.debug(`GraphQL: Orden encontrada - ID: ${ordenCompra.id}, tiene cliente: ${tieneCliente}, tiene empresa: ${tieneEmpresa}`);
        
        return ordenCompra;
      } catch (error) {
        return manejarErrorGraphQL(error, 'ordenCompra.query');
      }
    },    ordenesCompra: async (_parent: any, args: { filters?: any, orderBy?: string }, context: any, info: GraphQLResolveInfo) => {
      logger.info(`GraphQL Resolver: ordenesCompra - Solicitando listado de órdenes`);
      
      try {
        // Comentamos temporalmente la verificación de autenticación para pruebas
        /*
        if (!context.user) {
          logger.warn('GraphQL: Intento de acceso a ordenesCompra sin autenticación');
          throw new Error('No autenticado');
        }
        */

        // Configurar filtros
        const where: any = { estadoActivo: true }; // Por defecto solo ordenes activas
        
        if (args.filters) {
          // Filtros básicos
          if (args.filters.clienteId) where.clienteId = parseInt(args.filters.clienteId);
          if (args.filters.empresaId) where.empresaId = parseInt(args.filters.empresaId);
          
          // Búsqueda por texto
          if (args.filters.search) {
            where.OR = [
              { codigoVenta: { contains: args.filters.search, mode: 'insensitive' } },
              { cliente: { razonSocial: { contains: args.filters.search, mode: 'insensitive' } } },
              { empresa: { razonSocial: { contains: args.filters.search, mode: 'insensitive' } } },
            ];
          }
            // Filtros por fecha
          if (args.filters.fechaFrom || args.filters.fechaTo) {
            where.fechaEmision = {};
            if (args.filters.fechaFrom) where.fechaEmision.gte = new Date(args.filters.fechaFrom);
            if (args.filters.fechaTo) where.fechaEmision.lte = new Date(args.filters.fechaTo);
          }
        }

        // Configurar ordenamiento
        let orderBy: any = { createdAt: 'desc' };
        if (args.orderBy) {
          const [campo, direccion] = args.orderBy.split('_');
          if (campo && direccion) {
            orderBy = { [campo]: direccion.toLowerCase() };
          }
        }        // Obtener los campos solicitados primero para analizar la consulta
        const fields = getFields(info);
          // Log para diagnóstico
        logger.debug(`Campos solicitados (listado): ${JSON.stringify(fields)}`);
        
        // Obtener parámetros optimizados para consulta usando la nueva función
        const queryOptions = createOptimizedQueryParams(info, 'OrdenCompra');
        logger.debug(`Parámetros de consulta optimizados (listado): ${JSON.stringify(queryOptions)}`);
          
          // Si hay campos específicos en el nivel principal, también los incluimos
          if (queryOptions.select) {
            Object.keys(queryOptions.select).forEach(field => {
              // Asegurar que los campos básicos también se incluyan
              if (!['cliente', 'empresa'].includes(field)) {
                queryOptions.include = queryOptions.include || {};
                queryOptions.include[field] = true;
              }
            });
          }// Ejecutar consulta con opciones optimizadas
        const ordenes = await prisma.ordenCompra.findMany({
          where,
          ...queryOptions,
          orderBy,
        });
        
        // Devolver resultados directamente como array
        return ordenes;
      } catch (error) {
        return manejarErrorGraphQL(error, 'ordenesCompra.query');
      }
    }
    
  }
};
