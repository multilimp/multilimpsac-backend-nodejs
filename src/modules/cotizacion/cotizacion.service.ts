import { Cotizacion, Prisma } from '@prisma/client';
import prisma from '../../database/prisma';

// Asumiendo que CotizacionProducto se maneja aquí o se pasa como data anidada
type CreateCotizacionData = Omit<Cotizacion, 'id' | 'createdAt' | 'updatedAt'> & {
  productos?: Prisma.CotizacionProductoCreateNestedManyWithoutCotizacionInput; // Para crear productos junto con la cotización
};
type UpdateCotizacionData = Partial<Omit<Cotizacion, 'id' | 'createdAt' | 'updatedAt'>> & {
   productos?: Prisma.CotizacionProductoUpdateManyWithoutCotizacionNestedInput // Para actualizar productos
};


export const getAllCotizaciones = (): Promise<Cotizacion[]> => {
  return prisma.cotizacion.findMany({
    include: {
      cliente: true,
      empresa: true,
      contactoCliente: true,
      productos: true, // Incluir productos relacionados
    },
  });
};

export const getCotizacionById = (id: number): Promise<Cotizacion | null> => {
  return prisma.cotizacion.findUnique({
    where: { id },
    include: {
      cliente: true,
      empresa: true,
      contactoCliente: true,
      productos: true,
    },
  });
};

export const createCotizacion = (data: CreateCotizacionData): Promise<Cotizacion> => {
   // Validaciones básicas
   if (!data.codigoCotizacion || !data.empresaId || !data.clienteId || !data.montoTotal || !data.tipoPago) {
    throw new Error('Faltan campos requeridos para crear la cotización.');
  }
  // Convertir fechas si vienen como string
  if (data.fechaCotizacion && typeof data.fechaCotizacion === 'string') {
    data.fechaCotizacion = new Date(data.fechaCotizacion);
  }
  if (data.fechaEntrega && typeof data.fechaEntrega === 'string') {
    data.fechaEntrega = new Date(data.fechaEntrega);
  }

  return prisma.cotizacion.create({
    data: data as any, // Usar 'as any' si hay problemas con tipos anidados o Decimal
     include: {
      productos: true, // Devolver la cotización con sus productos
    },
   });
};

export const updateCotizacion = (id: number, data: UpdateCotizacionData): Promise<Cotizacion> => {
  // Convertir fechas si vienen como string
  if (data.fechaCotizacion && typeof data.fechaCotizacion === 'string') {
    data.fechaCotizacion = new Date(data.fechaCotizacion);
  }
  if (data.fechaEntrega && typeof data.fechaEntrega === 'string') {
    data.fechaEntrega = new Date(data.fechaEntrega);
  }

  return prisma.cotizacion.update({
    where: { id },
    data: data as any, // Usar 'as any' si hay problemas con tipos anidados o Decimal
    include: {
      productos: true, // Devolver la cotización actualizada con sus productos
    },
  });
};

export const deleteCotizacion = (id: number): Promise<Cotizacion> => {
  // Considerar borrado en cascada o manejo de productos relacionados si es necesario
  // Por defecto, Prisma podría requerir eliminar productos primero si no hay onDelete: Cascade
  // Opcionalmente, realizar la eliminación en una transacción
  return prisma.$transaction(async (tx) => {
    // 1. Eliminar productos relacionados (si es necesario y no hay cascada)
    await tx.cotizacionProducto.deleteMany({ where: { cotizacionId: id } });
    // 2. Eliminar la cotización
    const deletedCotizacion = await tx.cotizacion.delete({ where: { id } });
    return deletedCotizacion;
  });
  /* // Alternativa simple si hay onDelete: Cascade o no importa dejar productos huérfanos (revisar schema)
  return prisma.cotizacion.delete({
    where: { id },
  });
  */
};
