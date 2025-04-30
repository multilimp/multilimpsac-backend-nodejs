import prisma from '../../database/prisma';
// Cambiar la importación para usar el alias @prisma/client
import { Cliente } from '@prisma/client';

// import { Cliente } from '../../../generated/prisma'; // Comentar o eliminar la línea anterior

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

export const createClient = (data: CreateClientData): Promise<Cliente> => {
  return prisma.cliente.create({ data });
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
