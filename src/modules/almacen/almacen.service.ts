import { Almacen, Producto, StockProducto, Prisma } from '@prisma/client';
import prisma from '../../database/prisma';

type CreateAlmacenData = Omit<Almacen, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateAlmacenData = Partial<CreateAlmacenData>;

type CreateProductoData = Omit<Producto, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateProductoData = Partial<CreateProductoData>;

type CreateStockData = {
  productoId: number;
  almacenId: number;
  cantidad: number;
};

type UpdateStockData = {
  cantidad: number;
};

// ============ ALMACENES ============
export const getAllAlmacenes = (): Promise<Almacen[]> => {
  return prisma.almacen.findMany({
    include: {
      stockProductos: {
        include: {
          producto: true,
        },
      },
    },
  });
};

export const getAlmacenById = (id: number): Promise<Almacen | null> => {
  return prisma.almacen.findUnique({
    where: { id },
    include: {
      stockProductos: {
        include: {
          producto: true,
        },
      },
    },
  });
};

export const createAlmacen = (data: CreateAlmacenData): Promise<Almacen> => {
  return prisma.almacen.create({ data });
};

export const updateAlmacen = (id: number, data: UpdateAlmacenData): Promise<Almacen> => {
  return prisma.almacen.update({
    where: { id },
    data,
  });
};

export const deleteAlmacen = (id: number): Promise<Almacen> => {
  return prisma.almacen.delete({
    where: { id },
  });
};

// ============ PRODUCTOS ============
export const getAllProductos = (): Promise<Producto[]> => {
  return prisma.producto.findMany({
    include: {
      stockProductos: {
        include: {
          almacen: true,
        },
      },
    },
  });
};

export const getProductoById = (id: number): Promise<Producto | null> => {
  return prisma.producto.findUnique({
    where: { id },
    include: {
      stockProductos: {
        include: {
          almacen: true,
        },
      },
    },
  });
};

export const createProducto = (data: CreateProductoData): Promise<Producto> => {
  return prisma.producto.create({ data });
};

export const updateProducto = (id: number, data: UpdateProductoData): Promise<Producto> => {
  return prisma.producto.update({
    where: { id },
    data,
  });
};

export const deleteProducto = (id: number): Promise<Producto> => {
  return prisma.producto.delete({
    where: { id },
  });
};

// ============ STOCK ============
export const getAllStock = () => {
  return prisma.stockProducto.findMany({
    include: {
      producto: true,
      almacen: true,
    },
  });
};

export const getStockByAlmacen = (almacenId: number) => {
  return prisma.stockProducto.findMany({
    where: { almacenId },
    include: {
      producto: true,
      almacen: true,
    },
  });
};

export const getStockByProducto = (productoId: number) => {
  return prisma.stockProducto.findMany({
    where: { productoId },
    include: {
      producto: true,
      almacen: true,
    },
  });
};

export const createOrUpdateStock = async (data: CreateStockData): Promise<StockProducto> => {
  const existingStock = await prisma.stockProducto.findUnique({
    where: {
      productoId_almacenId: {
        productoId: data.productoId,
        almacenId: data.almacenId,
      },
    },
  });

  if (existingStock) {
    return prisma.stockProducto.update({
      where: {
        productoId_almacenId: {
          productoId: data.productoId,
          almacenId: data.almacenId,
        },
      },
      data: { cantidad: data.cantidad },
      include: {
        producto: true,
        almacen: true,
      },
    });
  } else {
    return prisma.stockProducto.create({
      data,
      include: {
        producto: true,
        almacen: true,
      },
    });
  }
};

export const updateStock = (
  productoId: number,
  almacenId: number,
  data: UpdateStockData
): Promise<StockProducto> => {
  return prisma.stockProducto.update({
    where: {
      productoId_almacenId: {
        productoId,
        almacenId,
      },
    },
    data,
    include: {
      producto: true,
      almacen: true,
    },
  });
};

export const deleteStock = (productoId: number, almacenId: number): Promise<StockProducto> => {
  return prisma.stockProducto.delete({
    where: {
      productoId_almacenId: {
        productoId,
        almacenId,
      },
    },
  });
};
