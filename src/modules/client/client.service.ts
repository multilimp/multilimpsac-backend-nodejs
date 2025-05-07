import { Cliente } from '../../../generated/prisma';
import prisma from '../../database/prisma';

type CreateClientData = Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateClientData = Partial<CreateClientData>;

export const getAllClients = (): Promise<Cliente[]> => {
  return prisma.cliente.findMany();
};

export const getClientById = (id: number): Promise<Cliente | null> => {
  return prisma.cliente.findUnique({
    where: { id },
  });
};

export const createClient = (data: any): Promise<Cliente> => {
  // Mapeo explícito de snake_case a camelCase para Prisma
  const mappedData = {
    ruc: data.ruc,
    razonSocial: data.razon_social ?? data.razonSocial,
    direccion: data.direccion,
    telefono: data.telefono,
    email: data.email,
    estado: data.estado,
    codigoUnidadEjecutora: data.cod_unidad ?? data.codigoUnidadEjecutora,
    departamento: data.departamento,
    provincia: data.provincia,
    distrito: data.distrito,
  };
  return prisma.cliente.create({ data: mappedData });
};

export const updateClient = (id: number, data: UpdateClientData): Promise<Cliente> => {
  return prisma.cliente.update({
    where: { id },
    data,
  });
};

export const deleteClient = (id: number): Promise<Cliente> => {
  return prisma.cliente.delete({
    where: { id },
  });
};
