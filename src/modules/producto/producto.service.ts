import { Producto, Prisma } from 'generated/prisma';
import prisma from '../../database/prisma';

type CreateProductoData = Omit<Producto, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateProductoData = Partial<CreateProductoData>;

// Función auxiliar para procesar datos (Decimal)
const processProductoData = (data: any) => {
  if (data.precioBase && typeof data.precioBase !== 'object') {
     data.precioBase = new Prisma.Decimal(data.precioBase);
  }
  return data;
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
  return prisma.producto.create({ data: processedData as any });
};

export const updateProducto = (id: number, data: UpdateProductoData): Promise<Producto> => {
  const processedData = processProductoData(data);
  return prisma.producto.update({
    where: { id },
    data: processedData as any,
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
