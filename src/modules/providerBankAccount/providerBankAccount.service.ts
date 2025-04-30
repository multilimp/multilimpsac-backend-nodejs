import prisma from '../../database/prisma';
// Cambiar la importación para usar el alias @prisma/client

import { CuentaBancariaProveedor } from '../../../generated/prisma'; // Comentar o eliminar la línea anterior

type CreateProviderBankAccountData = Omit<CuentaBancariaProveedor, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateProviderBankAccountData = Partial<CreateProviderBankAccountData>;

export const getBankAccountByProvider = (idProvider: number): Promise<CuentaBancariaProveedor[]> => {
  return prisma.cuentaBancariaProveedor.findMany({ where: { proveedorId: idProvider } });
};

export const createProviderBankAccount = (data: CreateProviderBankAccountData): Promise<CuentaBancariaProveedor> => {
  return prisma.cuentaBancariaProveedor.create({ data });
};

export const updateProviderBankAccount = (id: number, data: UpdateProviderBankAccountData): Promise<CuentaBancariaProveedor> => {
  return prisma.cuentaBancariaProveedor.update({
    where: { id },
    data,
  });
};

export const deleteProviderBankAccount = (id: number): Promise<CuentaBancariaProveedor> => {
  return prisma.cuentaBancariaProveedor.delete({
    where: { id },
  });
};
