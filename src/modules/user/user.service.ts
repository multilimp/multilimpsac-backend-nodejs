import { Usuario } from '@prisma/client';
import prisma from '../../database/prisma';

// Tipos para los datos de entrada (pueden moverse a un archivo de tipos)
type CreateUserData = Omit<Usuario, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateUserData = Partial<CreateUserData>;

export const getAllUsers = async (): Promise<Usuario[]> => {
  return prisma.usuario.findMany();
};

export const getUserById = async (id: number): Promise<Usuario | null> => {
  // Usar findUniqueOrThrow si se prefiere que lance error si no encuentra
  return prisma.usuario.findUnique({
    where: { id },
  });
};

export const createUser = async (data: CreateUserData): Promise<Usuario> => {
  return prisma.usuario.create({ data });
};

export const updateUser = async (id: number, data: UpdateUserData): Promise<Usuario> => {
  return prisma.usuario.update({
    where: { id },
    data,
  });
};

export const deleteUser = async (id: number): Promise<Usuario> => {
  return prisma.usuario.delete({
    where: { id },
  });
};
