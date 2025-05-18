// src/graphql/resolvers/ordenCompra.resolver.ts
import prisma from '../../database/prisma';
import { Prisma } from '@prisma/client';
import { GraphQLResolveInfo } from 'graphql';
import logger from '../../shared/config/logger';
import { optimizarConsultaPrisma, procesarError } from '../utils/resolverUtils';

export const ordenCompraResolvers = {
  Query: {
    ordenCompra: async (_parent: any, args: { id: string }, context: any, info: GraphQLResolveInfo) => {
      logger.info(`GraphQL Resolver: ordenCompra - Solicitando orden con ID: ${args.id}`);
      
      // Comentamos temporalmente la verificación de autenticación para pruebas
      // Si context.user no está disponible, usamos un mock para desarrollo
      /* 
      if (!context.user) {
        logger.warn('GraphQL: Intento de acceso a ordenCompra sin autenticación');
        throw new Error('No autenticado');
      }
      */
        try {
        // Obtener parámetros optimizados para consulta basados en campos solicitados
        const queryParams = optimizarConsultaPrisma(info, 'OrdenCompra');
        
        // Consultar la orden de compra con selección optimizada de campos
        const ordenCompra = await prisma.ordenCompra.findUnique({
          where: { id: parseInt(args.id) },
          ...queryParams,
        });
        
        if (!ordenCompra) {
          logger.warn(`GraphQL: Orden de compra con ID ${args.id} no encontrada`);
          throw new Error(`Orden de compra con ID ${args.id} no encontrada`);
        }
        
        logger.debug(`GraphQL: Orden encontrada - ID: ${ordenCompra.id}`);
        return ordenCompra;
      } catch (error) {
        return procesarError(error, 'ordenCompra');
      }
    },
    
    ordenesCompra: async (_parent: any, args: { page?: number, pageSize?: number, filters?: any, orderBy?: string }, context: any, info: GraphQLResolveInfo) => {
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
        }        // Obtener parámetros optimizados para consulta basados en campos solicitados
        const queryParams = optimizarConsultaPrisma(info, 'OrdenCompra');        // Configurar paginación
        const page = args.page || 1;
        const pageSize = args.pageSize || 10;
        const skip = (page - 1) * pageSize;
        
        // Ejecutar consulta y conteo en una transacción para consistencia
        const [ordenes, total] = await prisma.$transaction([
          prisma.ordenCompra.findMany({
            where,
            ...queryParams,
            orderBy,
            skip,
            take: pageSize,
          }),
          prisma.ordenCompra.count({ where }),
        ]);
        
        // Calcular total de páginas
        const totalPages = Math.ceil(total / pageSize);

        // Devolver resultados con metadata de paginación (con la estructura del tipo ResultadoPaginadoOrdenCompra)
        return {
          data: ordenes,
          total,
          totalPages,
          page,
          pageSize,
        };
      } catch (error) {
        return procesarError(error, 'ordenesCompra');
      }
    }
    
  }
};
