import prisma from '../../db/prisma';
import { User } from '@prisma/client'; // Importar el tipo User generado

// Tipos para los datos de entrada (pueden moverse a un archivo de tipos)
type CreateUserData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateUserData = Partial<CreateUserData>;

export const getAllUsers = async (): Promise<User[]> => {
  return prisma.user.findMany();
};

export const getUserById = async (id: number): Promise<User | null> => {
  // Usar findUniqueOrThrow si se prefiere que lance error si no encuentra
  return prisma.user.findUnique({
    where: { id },
  });
};

export const createUser = async (data: CreateUserData): Promise<User> => {
  return prisma.user.create({ data });
};

export const updateUser = async (id: number, data: UpdateUserData): Promise<User> => {
  return prisma.user.update({
    where: { id },
    data,
  });
};

export const deleteUser = async (id: number): Promise<User> => {
  return prisma.user.delete({
    where: { id },
  });
};
