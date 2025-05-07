import { AgrupacionOrdenCompra, Prisma } from '../../../generated/prisma';
import prisma from '../../database/prisma';

type CreateAgrupacionData = Omit<AgrupacionOrdenCompra, 'id' | 'createdAt' | 'updatedAt'> & {
  ordenesCompra?: Prisma.OrdenCompraAgrupadaCreateNestedManyWithoutAgrupacionInput; // Para añadir OCs al crear
};
type UpdateAgrupacionData = Partial<Omit<AgrupacionOrdenCompra, 'id' | 'createdAt' | 'updatedAt'>> & {
   ordenesCompra?: Prisma.OrdenCompraAgrupadaUpdateManyWithoutAgrupacionNestedInput; // Para modificar OCs asociadas
};

export const getAllAgrupaciones = (): Promise<AgrupacionOrdenCompra[]> => {
  return prisma.agrupacionOrdenCompra.findMany({
    include: {
      ordenesCompra: { include: { ordenCompra: true } }, // Incluir las OCs agrupadas
    },
  });
};

export const getAgrupacionById = (id: number): Promise<AgrupacionOrdenCompra | null> => {
  return prisma.agrupacionOrdenCompra.findUnique({
    where: { id },
    include: {
      ordenesCompra: { include: { ordenCompra: true } },
    },
  });
};

export const createAgrupacion = (data: CreateAgrupacionData): Promise<AgrupacionOrdenCompra> => {
   if (!data.codigoGrupo) {
    throw new Error('Falta el campo requerido: codigoGrupo.');
  }
   // Convertir fecha si viene como string
  if (data.fecha && typeof data.fecha === 'string') {
    data.fecha = new Date(data.fecha);
  }

  return prisma.agrupacionOrdenCompra.create({
    data: data as any,
    include: {
        ordenesCompra: { include: { ordenCompra: true } },
    }
   });
};

export const updateAgrupacion = (id: number, data: UpdateAgrupacionData): Promise<AgrupacionOrdenCompra> => {
  if (data.fecha && typeof data.fecha === 'string') {
    data.fecha = new Date(data.fecha);
  }
  return prisma.agrupacionOrdenCompra.update({
    where: { id },
    data: data as any,
     include: {
        ordenesCompra: { include: { ordenCompra: true } },
    }
  });
};

export const deleteAgrupacion = (id: number): Promise<AgrupacionOrdenCompra> => {
  // Eliminar primero las relaciones en OrdenCompraAgrupada
   return prisma.$transaction(async (tx) => {
     await tx.ordenCompraAgrupada.deleteMany({ where: { agrupacionOrdenCompraId: id } });
     const deletedAgrupacion = await tx.agrupacionOrdenCompra.delete({ where: { id } });
     return deletedAgrupacion;
   });
  /*
  return prisma.agrupacionOrdenCompra.delete({
    where: { id },
  });
  */
};

// Funciones adicionales para manejar la relación OrdenCompraAgrupada
export const addOrdenCompraToAgrupacion = (agrupacionId: number, ordenCompraId: number): Promise<AgrupacionOrdenCompra> => {
    return prisma.agrupacionOrdenCompra.update({
        where: { id: agrupacionId },
        data: {
            ordenesCompra: {
                create: {
                    ordenCompraId: ordenCompraId,
                }
            }
        },
        include: { ordenesCompra: { include: { ordenCompra: true } } }
    });
}

export const removeOrdenCompraFromAgrupacion = (agrupacionId: number, ordenCompraId: number): Promise<AgrupacionOrdenCompra> => {
     return prisma.agrupacionOrdenCompra.update({
        where: { id: agrupacionId },
        data: {
            ordenesCompra: {
                deleteMany: { // O delete si tienes el ID de OrdenCompraAgrupada
                    ordenCompraId: ordenCompraId,
                    // agrupacionOrdenCompraId: agrupacionId // Prisma infiere esto
                }
            }
        },
         include: { ordenesCompra: { include: { ordenCompra: true } } }
    });
}
