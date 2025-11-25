import { StockProducto } from '../../../prisma/generated/client';
import prisma from '../../database/prisma';
type CreateStockProductoData = Omit<StockProducto, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateStockProductoData = Partial<CreateStockProductoData>;
export const getAllStockProducto = (): Promise<StockProducto[]> => {
  return prisma.stockProducto.findMany();
};
export const getStockProductoById = (id: number): Promise<StockProducto | null> => {
  return prisma.stockProducto.findUnique({ where: { id } });
};
export const createStockProducto = (data: CreateStockProductoData): Promise<StockProducto> => {
  return prisma.stockProducto.create({ data });
};
export const updateStockProducto = (id: number, data: UpdateStockProductoData): Promise<StockProducto> => {
  return prisma.stockProducto.update({ where: { id }, data });
};
export const deleteStockProducto = (id: number): Promise<StockProducto> => {
  return prisma.stockProducto.delete({ where: { id } });
};
