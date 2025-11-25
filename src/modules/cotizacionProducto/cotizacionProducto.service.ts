import { CotizacionProducto } from '../../../prisma/generated/client';
import prisma from '../../database/prisma';

type CreateCotizacionProductoData = Omit<CotizacionProducto, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateCotizacionProductoData = Partial<CreateCotizacionProductoData>;

export const getAllCotizacionProductos = (): Promise<CotizacionProducto[]> => {
  return prisma.cotizacionProducto.findMany();
};

export const getCotizacionProductoById = (id: number): Promise<CotizacionProducto | null> => {
  return prisma.cotizacionProducto.findUnique({ where: { id } });
};

export const createCotizacionProducto = (data: CreateCotizacionProductoData): Promise<CotizacionProducto> => {
  return prisma.cotizacionProducto.create({ data });
};

export const updateCotizacionProducto = (id: number, data: UpdateCotizacionProductoData): Promise<CotizacionProducto> => {
  return prisma.cotizacionProducto.update({ where: { id }, data });
};

export const deleteCotizacionProducto = (id: number): Promise<CotizacionProducto> => {
  return prisma.cotizacionProducto.delete({ where: { id } });
};
