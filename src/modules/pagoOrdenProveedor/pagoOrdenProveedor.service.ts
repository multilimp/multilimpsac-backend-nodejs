import { PagoOrdenProveedor } from 'generated/prisma';
import prisma from '../../database/prisma';
type CreatePagoOrdenProveedorData = Omit<PagoOrdenProveedor, 'id' | 'createdAt' | 'updatedAt'>;
type UpdatePagoOrdenProveedorData = Partial<CreatePagoOrdenProveedorData>;
export const getAllPagoOrdenProveedor = (): Promise<PagoOrdenProveedor[]> => {
  return prisma.pagoOrdenProveedor.findMany();
};
export const getPagoOrdenProveedorById = (id: number): Promise<PagoOrdenProveedor | null> => {
  return prisma.pagoOrdenProveedor.findUnique({ where: { id } });
};
export const createPagoOrdenProveedor = (data: CreatePagoOrdenProveedorData): Promise<PagoOrdenProveedor> => {
  return prisma.pagoOrdenProveedor.create({ data });
};
export const updatePagoOrdenProveedor = (id: number, data: UpdatePagoOrdenProveedorData): Promise<PagoOrdenProveedor> => {
  return prisma.pagoOrdenProveedor.update({ where: { id }, data });
};
export const deletePagoOrdenProveedor = (id: number): Promise<PagoOrdenProveedor> => {
  return prisma.pagoOrdenProveedor.delete({ where: { id } });
};
