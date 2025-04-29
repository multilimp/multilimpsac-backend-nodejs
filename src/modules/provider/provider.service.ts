import prisma from '../../database/prisma';
import { Proveedor } from '../../../generated/prisma';

type CreateProviderData = Omit<Proveedor, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateProviderData = Partial<CreateProviderData>;

export const getAllProviders = (): Promise<Proveedor[]> => {
  return prisma.proveedor.findMany();
};

export const getProviderById = (id: number): Promise<Proveedor | null> => {
  return prisma.proveedor.findUnique({
    where: { id },
  });
};

export const createProvider = (data: CreateProviderData): Promise<Proveedor> => {
  return prisma.proveedor.create({ data });
};

export const updateProvider = (id: number, data: UpdateProviderData): Promise<Proveedor> => {
  return prisma.proveedor.update({
    where: { id },
    data,
  });
};

export const deleteProvider = (id: number): Promise<Proveedor> => {
  return prisma.proveedor.delete({
    where: { id },
  });
};
