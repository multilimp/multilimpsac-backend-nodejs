import { Facturacion } from '@prisma/client';
import prisma from '../../database/prisma';
type CreateFacturacionData = Omit<Facturacion, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateFacturacionData = Partial<CreateFacturacionData>;
export const getAllFacturacion = (): Promise<Facturacion[]> => {
  return prisma.facturacion.findMany();
};
export const getFacturacionById = (id: number): Promise<Facturacion | null> => {
  return prisma.facturacion.findUnique({ where: { id } });
};
export const createFacturacion = (data: CreateFacturacionData): Promise<Facturacion> => {
  return prisma.facturacion.create({ data });
};
export const updateFacturacion = (id: number, data: UpdateFacturacionData): Promise<Facturacion> => {
  return prisma.facturacion.update({ where: { id }, data });
};
export const deleteFacturacion = (id: number): Promise<Facturacion> => {
  return prisma.facturacion.delete({ where: { id } });
};
