import { PagoOrdenCompraPrivada } from '../../../prisma/generated/client';
import prisma from '../../database/prisma';
type CreatePagoOrdenCompraPrivadaData = Omit<PagoOrdenCompraPrivada, 'id' | 'createdAt' | 'updatedAt'>;
type UpdatePagoOrdenCompraPrivadaData = Partial<CreatePagoOrdenCompraPrivadaData>;
export const getAllPagoOrdenCompraPrivada = (): Promise<PagoOrdenCompraPrivada[]> => {
  return prisma.pagoOrdenCompraPrivada.findMany();
};
export const getPagoOrdenCompraPrivadaById = (id: number): Promise<PagoOrdenCompraPrivada | null> => {
  return prisma.pagoOrdenCompraPrivada.findUnique({ where: { id } });
};
export const createPagoOrdenCompraPrivada = (data: CreatePagoOrdenCompraPrivadaData): Promise<PagoOrdenCompraPrivada> => {
  return prisma.pagoOrdenCompraPrivada.create({ data });
};
export const updatePagoOrdenCompraPrivada = (id: number, data: UpdatePagoOrdenCompraPrivadaData): Promise<PagoOrdenCompraPrivada> => {
  return prisma.pagoOrdenCompraPrivada.update({ where: { id }, data });
};
export const deletePagoOrdenCompraPrivada = (id: number): Promise<PagoOrdenCompraPrivada> => {
  return prisma.pagoOrdenCompraPrivada.delete({ where: { id } });
};
