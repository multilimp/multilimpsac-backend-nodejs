// src/graphql/resolvers/ordenCompra.resolver.ts
import prisma from '../../database/prisma'; // Ajusta la ruta a tu cliente Prisma
import { Prisma } from '@prisma/client';
import { GraphQLResolveInfo } from 'graphql';

// Función para parsear campos solicitados y construir el 'include' de Prisma
// Esta es una parte crucial para la selección dinámica de datos.
// Puedes usar una librería como 'graphql-fields' o implementarlo manualmente.
// Ejemplo conceptual de cómo podrías obtener los campos (simplificado):
const getIncludes = (info: GraphQLResolveInfo) => {
    // Aquí analizarías info.fieldNodes para determinar qué campos y relaciones se pidieron.
    // Por simplicidad, este ejemplo no implementa el parseo completo.
    // En una implementación real, esto construiría un objeto Prisma.OrdenCompraInclude.
    // Por ejemplo, si se pide 'cliente', el include sería { cliente: true }
    // Si se pide 'cliente { razonSocial }', sería { cliente: { select: { razonSocial: true } } }
    // Librerías como graphql-fields pueden ayudar mucho aquí.
    // O puedes usar getPrismaIncludeFromGraphQLResolveInfo si usas @prisma/graphql-platform (aunque es más para autogeneración)

    // Ejemplo básico (deberías hacerlo dinámico):
    const requestedFields = Object.keys(require('graphql-fields')(info)); // Ejemplo usando graphql-fields
    const include: Prisma.OrdenCompraInclude = {};

    if (requestedFields.includes('cliente')) include.cliente = true;
    if (requestedFields.includes('empresa')) include.empresa = true;
    if (requestedFields.includes('contactoCliente')) include.contactoCliente = true;
    if (requestedFields.includes('ordenesProveedor')) include.ordenesProveedor = true;
    // ... y así para otras relaciones

    return include;
};


export const ordenCompraResolvers = {
  Query: {
    ordenCompra: async (_parent: any, args: { id: string }, _context: any, info: GraphQLResolveInfo) => {
      const include = getIncludes(info); // Construir 'include' dinámicamente
      return prisma.ordenCompra.findUnique({
        where: { id: parseInt(args.id) },
        include,
      });
    },
    ordenesCompra: async (_parent: any, args: { page?: number, pageSize?: number, filters?: any, orderBy?: string }, _context: any, info: GraphQLResolveInfo) => {
      const page = args.page || 1;
      const pageSize = args.pageSize || 10;
      const skip = (page - 1) * pageSize;

      const where: Prisma.OrdenCompraWhereInput = {};
      if (args.filters) {
        if (args.filters.clienteId) where.clienteId = args.filters.clienteId;
        if (args.filters.empresaId) where.empresaId = args.filters.empresaId;
        if (args.filters.search) {
            where.OR = [
                { codigoVenta: { contains: args.filters.search, mode: 'insensitive' } },
                { cliente: { razonSocial: { contains: args.filters.search, mode: 'insensitive' } } },
                { empresa: { razonSocial: { contains: args.filters.search, mode: 'insensitive' } } },
            ];
        }
        // if (args.filters.fechaFrom) where.fechaEmision = { ...where.fechaEmision, gte: new Date(args.filters.fechaFrom) };
        // if (args.filters.fechaTo) where.fechaEmision = { ...where.fechaEmision, lte: new Date(args.filters.fechaTo) };
        // Añadir más filtros según tu `OrdenCompraFiltersInput`
      }
      where.estadoActivo = true; // Asumiendo que siempre quieres activas

      let orderByClause: Prisma.OrdenCompraOrderByWithRelationInput | Prisma.OrdenCompraOrderByWithRelationInput[] = { createdAt: 'desc' };
      if (args.orderBy) {
        const [field, direction] = args.orderBy.split('_');
        if (field && direction) {
            orderByClause = { [field]: direction.toLowerCase() as Prisma.SortOrder };
        }
      }

      const include = getIncludes(info); // Construir 'include' dinámicamente para los items

      const [ordenes, total] = await prisma.$transaction([
        prisma.ordenCompra.findMany({
          where,
          skip,
          take: pageSize,
          include,
          orderBy: orderByClause,
        }),
        prisma.ordenCompra.count({ where }),
      ]);

      return {
        data: ordenes,
        total,
        totalPages: Math.ceil(total / pageSize),
        page,
        pageSize
      };
    },
  },
  // Si tienes campos complejos o relaciones que no se resuelven directamente con el include principal,
  // puedes añadir resolvers a nivel de campo aquí.
  // Ejemplo:
  // OrdenCompra: {
  //   cliente: async (parent: OrdenCompra, _args: any, _context: any, info: GraphQLResolveInfo) => {
  //     // Si 'cliente' no fue incluido por getIncludes, puedes cargarlo aquí.
  //     // Esto es útil para el problema N+1 si usas DataLoader.
  //     if (parent.clienteId && !parent.cliente) {
  //       return prisma.cliente.findUnique({ where: { id: parent.clienteId } });
  //     }
  //     return parent.cliente;
  //   },
  // },
};
