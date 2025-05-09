import { Proveedor } from '@prisma/client';
import prisma from '../../database/prisma';
// Cambiar la importación para usar el alias @prisma/client

// import { Proveedor } from '@prisma/client'; // Comentar o eliminar la línea anterior

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

export const createProvider = (data: any): Promise<Proveedor> => {
  const mappedData = {
    ruc: data.ruc,
    razonSocial: data.razon_social ?? data.razonSocial,
    direccion: data.direccion,
    telefono: data.telefono,
    email: data.email,
    estado: data.estado,
    departamento: data.departamento,
    provincia: data.provincia,
    distrito: data.distrito,
  };
  return prisma.proveedor.create({ data: mappedData });
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
