import { Almacen, Prisma } from 'generated/prisma';
import prisma from '../../database/prisma';

type CreateAlmacenData = Omit<Almacen, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateAlmacenData = Partial<CreateAlmacenData>;

export const getAllAlmacenes = (): Promise<Almacen[]> => {
  return prisma.almacen.findMany();
};

export const getAlmacenById = (id: number): Promise<Almacen | null> => {
  return prisma.almacen.findUnique({
    where: { id },
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
