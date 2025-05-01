import { OrdenCompra, Prisma } from 'generated/prisma';
import prisma from '../../database/prisma';

export const getAllOrdenesCompra = (args?: Prisma.OrdenCompraFindManyArgs): Promise<OrdenCompra[]> => {
  return prisma.ordenCompra.findMany(args);
};

export const getOrdenCompraById = (id: number, args?: Prisma.OrdenCompraFindUniqueArgs): Promise<OrdenCompra | null> => {
  return prisma.ordenCompra.findUnique({
    where: { id },
    ...args,
  });
};

export const createOrdenCompra = (data: Prisma.OrdenCompraCreateInput): Promise<OrdenCompra> => {
  return prisma.ordenCompra.create({ data });
};

export const updateOrdenCompra = (id: number, data: Prisma.OrdenCompraUpdateInput): Promise<OrdenCompra> => {
  return prisma.ordenCompra.update({
    where: { id },
    data,
  });
};

export const deleteOrdenCompra = (id: number): Promise<OrdenCompra> => {
  return prisma.ordenCompra.delete({
    where: { id },
  });
};

export const generateUniqueOrdenCompraCode = async (empresaId: number): Promise<string> => {
  const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });
  if (!empresa) throw new Error('Empresa no encontrada');
  const prefix = 'OC';
  const nombre = empresa.razonSocial.replace(/\s+/g, '').toUpperCase();
  const letras = nombre.substring(0, 3);
  const lastOrden = await prisma.ordenCompra.findFirst({
    where: { empresaId },
    orderBy: { id: 'desc' },
    select: { id: true },
  });
  const numero = lastOrden ? lastOrden.id : 1;
  return `${prefix}${letras}${numero}`;
};
