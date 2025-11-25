import { Producto, Prisma } from '../../../prisma/generated/client';
import prisma from '../../database/prisma';

type CreateProductoData = Omit<Producto, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateProductoData = Partial<CreateProductoData>;

const processProductoData = <T extends CreateProductoData | UpdateProductoData>(data: T): T => {
  const next = { ...data } as T;
  if ((next as any).precioBase && typeof (next as any).precioBase !== 'object') {
    (next as any).precioBase = new Prisma.Decimal((next as any).precioBase as unknown as number | string);
  }
  return next;
}

export const getAllProductos = (): Promise<Producto[]> => {
  return prisma.producto.findMany({
    include: {
      stockProductos: { include: { almacen: true } }, // Incluir stock y almacén
    },
  });
};

export const getProductoById = (id: number): Promise<Producto | null> => {
  return prisma.producto.findUnique({
    where: { id },
     include: {
      stockProductos: { include: { almacen: true } },
    },
  });
};

export const createProducto = (data: CreateProductoData): Promise<Producto> => {
   if (!data.nombre) {
    throw new Error('Falta el campo requerido: nombre.');
  }
  const processedData = processProductoData(data);
  return prisma.producto.create({ data: processedData });
};

export const updateProducto = (id: number, data: UpdateProductoData): Promise<Producto> => {
  const processedData = processProductoData(data);
  return prisma.producto.update({
    where: { id },
    data: processedData,
  });
};

export const deleteProducto = (id: number): Promise<Producto> => {
   // Considerar relaciones (StockProducto)
   return prisma.$transaction(async (tx) => {
     await tx.stockProducto.deleteMany({ where: { productoId: id } });
     const deletedProducto = await tx.producto.delete({ where: { id } });
     return deletedProducto;
   });
  /*
  return prisma.producto.delete({
    where: { id },
  });
  */
};
