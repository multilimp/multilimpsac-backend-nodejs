import { Transporte } from 'generated/prisma';
import prisma from '../../database/prisma';


type CreateTransportData = Omit<Transporte, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateTransportData = Partial<CreateTransportData>;

export const getAllTransports = (): Promise<Transporte[]> => {
  return prisma.transporte.findMany();
};

export const getTransportById = (id: number): Promise<Transporte | null> => {
  return prisma.transporte.findUnique({
    where: { id },
  });
};

export const createTransport = (data: CreateTransportData): Promise<Transporte> => {
  return prisma.transporte.create({ data });
};

export const updateTransport = (id: number, data: UpdateTransportData): Promise<Transporte> => {
  return prisma.transporte.update({
    where: { id },
    data,
  });
};

export const deleteTransport = (id: number): Promise<Transporte> => {
  return prisma.transporte.delete({
    where: { id },
  });
};
