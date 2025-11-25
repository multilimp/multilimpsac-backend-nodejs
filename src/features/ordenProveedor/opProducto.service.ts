import { OpProducto, Prisma } from '../../../prisma/generated/client';
import prisma from '../../database/prisma';

type CreateOpProductoData = Omit<OpProducto, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateOpProductoData = Partial<Omit<OpProducto, 'id' | 'createdAt' | 'updatedAt'>>;

// Función auxiliar para procesar datos (Decimal)
const processOpProductoData = (data: any) => {
  if (data.precioUnitario && typeof data.precioUnitario !== 'object') {
    data.precioUnitario = new Prisma.Decimal(data.precioUnitario);
  }
  if (data.total && typeof data.total !== 'object') {
    data.total = new Prisma.Decimal(data.total);
  }
  return data;
};

export const getOpProductosByOrdenProveedorId = async (ordenProveedorId: number): Promise<OpProducto[]> => {
  return prisma.opProducto.findMany({
    where: { ordenProveedorId },
    orderBy: { id: 'asc' },
  });
};

export const getOpProductoById = async (id: number): Promise<OpProducto | null> => {
  return prisma.opProducto.findUnique({
    where: { id },
  });
};

export const createOpProducto = async (data: CreateOpProductoData): Promise<OpProducto> => {
  const processedData = processOpProductoData(data);
  return prisma.opProducto.create({
    data: processedData as CreateOpProductoData,
  });
};

export const updateOpProducto = async (id: number, data: UpdateOpProductoData): Promise<OpProducto> => {
  const processedData = processOpProductoData(data);
  return prisma.opProducto.update({
    where: { id },
    data: processedData as UpdateOpProductoData,
  });
};

export const deleteOpProducto = async (id: number): Promise<OpProducto> => {
  return prisma.opProducto.delete({
    where: { id },
  });
};

export const updateMultipleOpProductos = async (
  ordenProveedorId: number,
  productos: Array<Partial<OpProducto> & { tempId?: string }>
): Promise<OpProducto[]> => {
  return prisma.$transaction(async (tx) => {
    // Obtener productos existentes
    const existingProducts = await tx.opProducto.findMany({
      where: { ordenProveedorId },
    });

    const results: OpProducto[] = [];

    // Procesar cada producto del input
    for (const producto of productos) {
      const processedData = processOpProductoData({ ...producto });
      delete processedData.tempId; // Remover tempId si existe

      if (producto.id && producto.id > 0) {
        // Actualizar producto existente
        const updated = await tx.opProducto.update({
          where: { id: producto.id },
          data: {
            ...processedData,
            ordenProveedorId,
          },
        });
        results.push(updated);
      } else {
        // Crear nuevo producto
        const created = await tx.opProducto.create({
          data: {
            ...processedData,
            ordenProveedorId,
          },
        });
        results.push(created);
      }
    }

    // Eliminar productos que ya no están en la lista
    const newIds = results.map(p => p.id);
    const toDelete = existingProducts.filter(p => !newIds.includes(p.id));
    
    for (const producto of toDelete) {
      await tx.opProducto.delete({
        where: { id: producto.id },
      });
    }

    return results;
  });
};
