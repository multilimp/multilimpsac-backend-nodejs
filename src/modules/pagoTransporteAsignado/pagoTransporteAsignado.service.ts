import { PagoTransporteAsignado } from '../../../prisma/generated/client';
import prisma from '../../database/prisma';
type CreatePagoTransporteAsignadoData = Omit<PagoTransporteAsignado, 'id' | 'createdAt' | 'updatedAt'>;
type UpdatePagoTransporteAsignadoData = Partial<CreatePagoTransporteAsignadoData>;
export const getAllPagoTransporteAsignado = (): Promise<PagoTransporteAsignado[]> => {
  return prisma.pagoTransporteAsignado.findMany();
};
export const getPagoTransporteAsignadoById = (id: number): Promise<PagoTransporteAsignado | null> => {
  return prisma.pagoTransporteAsignado.findUnique({ where: { id } });
};
export const createPagoTransporteAsignado = (data: CreatePagoTransporteAsignadoData): Promise<PagoTransporteAsignado> => {
  return prisma.pagoTransporteAsignado.create({ data });
};
export const updatePagoTransporteAsignado = (id: number, data: UpdatePagoTransporteAsignadoData): Promise<PagoTransporteAsignado> => {
  return prisma.pagoTransporteAsignado.update({ where: { id }, data });
};
export const deletePagoTransporteAsignado = (id: number): Promise<PagoTransporteAsignado> => {
  return prisma.pagoTransporteAsignado.delete({ where: { id } });
};
