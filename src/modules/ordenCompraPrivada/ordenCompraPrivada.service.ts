import { OrdenCompraPrivada } from '@prisma/client';
import prisma from '../../database/prisma';
type CreateOrdenCompraPrivadaData = Omit<OrdenCompraPrivada, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateOrdenCompraPrivadaData = Partial<CreateOrdenCompraPrivadaData>;
export const getAllOrdenCompraPrivada = (): Promise<OrdenCompraPrivada[]> => {
  return prisma.ordenCompraPrivada.findMany();
};
export const getOrdenCompraPrivadaById = (id: number): Promise<OrdenCompraPrivada | null> => {
  return prisma.ordenCompraPrivada.findUnique({ where: { id } });
};
export const createOrdenCompraPrivada = (data: CreateOrdenCompraPrivadaData): Promise<OrdenCompraPrivada> => {
  return prisma.ordenCompraPrivada.create({ data });
};
export const updateOrdenCompraPrivada = (id: number, data: UpdateOrdenCompraPrivadaData): Promise<OrdenCompraPrivada> => {
  return prisma.ordenCompraPrivada.update({ where: { id }, data });
};
export const deleteOrdenCompraPrivada = (id: number): Promise<OrdenCompraPrivada> => {
  return prisma.ordenCompraPrivada.delete({ where: { id } });
};
