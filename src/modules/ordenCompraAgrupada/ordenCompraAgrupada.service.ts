import { OrdenCompraAgrupada } from 'generated/prisma';
import prisma from '../../database/prisma';
type CreateOrdenCompraAgrupadaData = Omit<OrdenCompraAgrupada, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateOrdenCompraAgrupadaData = Partial<CreateOrdenCompraAgrupadaData>;
export const getAllOrdenCompraAgrupada = (): Promise<OrdenCompraAgrupada[]> => {
  return prisma.ordenCompraAgrupada.findMany();
};
export const getOrdenCompraAgrupadaById = (id: number): Promise<OrdenCompraAgrupada | null> => {
  return prisma.ordenCompraAgrupada.findUnique({ where: { id } });
};
export const createOrdenCompraAgrupada = (data: CreateOrdenCompraAgrupadaData): Promise<OrdenCompraAgrupada> => {
  return prisma.ordenCompraAgrupada.create({ data });
};
export const updateOrdenCompraAgrupada = (id: number, data: UpdateOrdenCompraAgrupadaData): Promise<OrdenCompraAgrupada> => {
  return prisma.ordenCompraAgrupada.update({ where: { id }, data });
};
export const deleteOrdenCompraAgrupada = (id: number): Promise<OrdenCompraAgrupada> => {
  return prisma.ordenCompraAgrupada.delete({ where: { id } });
};
