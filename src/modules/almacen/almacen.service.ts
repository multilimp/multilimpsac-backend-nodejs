import { Almacen, Producto, StockProducto } from '../../../prisma/generated/client';
import prisma from '../../database/prisma';

// TTL constants removed (no backend cache)

type CreateAlmacenData = Omit<Almacen, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateAlmacenData = Partial<CreateAlmacenData>;

type CreateProductoData = Omit<Producto, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateProductoData = Partial<CreateProductoData>;

type CreateStockData = {
  productoId: number;
  almacenId: number;
  cantidad: number;
  referencia?: string;
};

type UpdateStockData = {
  cantidad: number;
  referencia?: string;
};

// ============ ALMACENES ============
export const getAllAlmacenes = async (): Promise<Almacen[]> => {
  return prisma.almacen.findMany({
    include: {
      stockProductos: {
        include: { producto: true },
      },
    },
  });
};

export const getAlmacenById = async (id: number): Promise<Almacen | null> => {
  return prisma.almacen.findUnique({
    where: { id },
    include: {
      stockProductos: {
        include: { producto: true },
      },
    },
  });
};

export const createAlmacen = (data: CreateAlmacenData): Promise<Almacen> => {
  return prisma.almacen.create({ data });
};

export const updateAlmacen = (id: number, data: UpdateAlmacenData): Promise<Almacen> => {
  return prisma.almacen.update({ where: { id }, data });
};

export const deleteAlmacen = (id: number): Promise<Almacen> => {
  return prisma.almacen.delete({ where: { id } });
};

// ============ PRODUCTOS ============
export const getAllProductos = async (): Promise<Producto[]> => {
  return prisma.producto.findMany({
    include: {
      stockProductos: {
        include: { almacen: true },
      },
    },
  });
};

export const getProductoById = async (id: number): Promise<Producto | null> => {
  return prisma.producto.findUnique({
    where: { id },
    include: {
      stockProductos: {
        include: { almacen: true },
      },
    },
  });
};

export const createProducto = (data: CreateProductoData): Promise<Producto> => {
  return prisma.producto.create({ data });
};

export const updateProducto = (id: number, data: UpdateProductoData): Promise<Producto> => {
  return prisma.producto.update({ where: { id }, data });
};

export const deleteProducto = (id: number): Promise<Producto> => {
  return prisma.producto.delete({ where: { id } });
};

// ============ STOCK ============
export const getAllStock = async () => {
  return prisma.stockProducto.findMany({
    include: { producto: true, almacen: true },
  });
};

export const getStockByAlmacen = async (almacenId: number) => {
  return prisma.stockProducto.findMany({
    where: { almacenId },
    include: { producto: true, almacen: true },
  });
};

export const getStockByProducto = async (productoId: number) => {
  return prisma.stockProducto.findMany({
    where: { productoId },
    include: { producto: true, almacen: true },
  });
};

export const getMovimientosByStock = async (productoId: number, almacenId: number) => {
  return (prisma as any).movimientoStock.findMany({
    where: { productoId, almacenId },
    orderBy: { createdAt: 'desc' },
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
    const delta = data.cantidad - existingStock.cantidad;
    const updated = await prisma.stockProducto.update({
      where: {
        productoId_almacenId: {
          productoId: data.productoId,
          almacenId: data.almacenId,
        },
      },
      data: { cantidad: data.cantidad },
      include: { producto: true, almacen: true },
    });

    if (delta !== 0) {
      await (prisma as any).movimientoStock.create({
        data: {
          productoId: data.productoId,
          almacenId: data.almacenId,
          cantidad: Math.abs(delta),
          tipo: delta > 0 ? 'ENTRADA' : 'SALIDA',
          referencia: data.referencia ?? 'Actualización de stock',
        },
      });
    }

    return updated;
  } else {
    const created = await prisma.stockProducto.create({
      data: {
        productoId: data.productoId,
        almacenId: data.almacenId,
        cantidad: data.cantidad,
      },
      include: { producto: true, almacen: true },
    });

    await (prisma as any).movimientoStock.create({
      data: {
        productoId: data.productoId,
        almacenId: data.almacenId,
        cantidad: data.cantidad,
        tipo: 'ENTRADA',
        referencia: data.referencia ?? 'Creación de stock',
      },
    });

    return created;
  }
};

export const updateStock = (
  productoId: number,
  almacenId: number,
  data: UpdateStockData
): Promise<StockProducto> => {
  return prisma.$transaction(async (tx) => {
    const current = await tx.stockProducto.findUnique({
      where: { productoId_almacenId: { productoId, almacenId } },
    });

    const updated = await tx.stockProducto.update({
      where: { productoId_almacenId: { productoId, almacenId } },
      data: { cantidad: data.cantidad },
      include: { producto: true, almacen: true },
    });

    if (current && current.cantidad !== data.cantidad) {
      const delta = data.cantidad - current.cantidad;
      await (tx as any).movimientoStock.create({
        data: {
          productoId,
          almacenId,
          cantidad: Math.abs(delta),
          tipo: delta > 0 ? 'ENTRADA' : 'SALIDA',
          referencia: data.referencia ?? 'Actualización de stock',
        },
      });
    }

    return updated;
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
