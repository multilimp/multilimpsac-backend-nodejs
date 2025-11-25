import { OpProducto } from '../../../prisma/generated/client';
import prisma from '../../database/prisma';
type CreateOpProductoData = Omit<OpProducto, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateOpProductoData = Partial<CreateOpProductoData>;
export const getAllOpProducto = (): Promise<OpProducto[]> => {
  return prisma.opProducto.findMany();
};
export const getOpProductoById = (id: number): Promise<OpProducto | null> => {
  return prisma.opProducto.findUnique({ where: { id } });
};
export const createOpProducto = (data: CreateOpProductoData): Promise<OpProducto> => {
  return prisma.opProducto.create({ data });
};
export const updateOpProducto = (id: number, data: UpdateOpProductoData): Promise<OpProducto> => {
  return prisma.opProducto.update({ where: { id }, data });
};
export const deleteOpProducto = (id: number): Promise<OpProducto> => {
  return prisma.opProducto.delete({ where: { id } });
};
