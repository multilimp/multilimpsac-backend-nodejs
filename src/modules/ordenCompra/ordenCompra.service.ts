import { OrdenCompra, Prisma } from '@prisma/client';
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
  return prisma.ordenCompra.update({
    where: { id },
    data: { estadoActivo: false }
  });
};

export const generateUniqueOrdenCompraCode = async (empresaId: number): Promise<string> => {
  const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });
  if (!empresa) throw new Error('Empresa no encontrada');
  const empresaPrefix = empresa.razonSocial
    .replace(/\s+/g, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .substring(0, 3);
  const prefix = `OC${empresaId}-${empresaPrefix}-`;
  let nextNumber = 1;
  let codigo: string = '';
  let exists = true;
  while (exists) {
    codigo = `${prefix}${nextNumber}`;
    const existing = await prisma.ordenCompra.findUnique({ where: { codigoVenta: codigo } });
    if (!existing) {
      exists = false;
    } else {
      nextNumber++;
    }
  }
  return codigo;
};
