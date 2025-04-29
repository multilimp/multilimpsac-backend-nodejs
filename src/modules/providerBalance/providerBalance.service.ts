import prisma from '../../database/prisma';
import { SaldoProveedor } from '../../../generated/prisma';

type CreateProviderBalanceData = Omit<SaldoProveedor, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateProviderBalanceData = Partial<CreateProviderBalanceData>;

export const getBalanceByProvider = (idProvider: number): Promise<SaldoProveedor[]> => {
  return prisma.saldoProveedor.findMany({ where: { proveedorId: idProvider } });
};

export const createProviderBalance = (data: CreateProviderBalanceData): Promise<SaldoProveedor> => {
  return prisma.saldoProveedor.create({ data });
};

export const updateProviderBalance = (id: number, data: UpdateProviderBalanceData): Promise<SaldoProveedor> => {
  return prisma.saldoProveedor.update({
    where: { id },
    data,
  });
};

export const deleteProviderBalance = (id: number): Promise<SaldoProveedor> => {
  return prisma.saldoProveedor.delete({
    where: { id },
  });
};
