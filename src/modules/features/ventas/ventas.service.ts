import { OrdenCompra } from 'generated/prisma';
import prisma from '../../../database/prisma';

export const getAllVentas = (
  page: number,
  pageSize: number
): Promise<OrdenCompra[]> => {
  const skip = (page - 1) * pageSize;

  return prisma.ordenCompra.findMany({});
};

export const getVentaById = (
  id: number
): Promise<OrdenCompra | null> => {
  return prisma.ordenCompra.findUnique({
    where: { id },
  });
};
