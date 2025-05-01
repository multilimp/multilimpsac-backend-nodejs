import { TransporteAsignado } from 'generated/prisma';
import prisma from '../../database/prisma';
type CreateTransporteAsignadoData = Omit<TransporteAsignado, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateTransporteAsignadoData = Partial<CreateTransporteAsignadoData>;
export const getAllTransporteAsignado = (): Promise<TransporteAsignado[]> => {
  return prisma.transporteAsignado.findMany();
};
export const getTransporteAsignadoById = (id: number): Promise<TransporteAsignado | null> => {
  return prisma.transporteAsignado.findUnique({ where: { id } });
};
export const createTransporteAsignado = (data: CreateTransporteAsignadoData): Promise<TransporteAsignado> => {
  return prisma.transporteAsignado.create({ data });
};
export const updateTransporteAsignado = (id: number, data: UpdateTransporteAsignadoData): Promise<TransporteAsignado> => {
  return prisma.transporteAsignado.update({ where: { id }, data });
};
export const deleteTransporteAsignado = (id: number): Promise<TransporteAsignado> => {
  return prisma.transporteAsignado.delete({ where: { id } });
};
