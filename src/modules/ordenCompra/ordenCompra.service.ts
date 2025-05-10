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
  // 1. Obtener la empresa
  const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });
  if (!empresa) {
    throw new Error('Empresa no encontrada');
  }

  // 2. Obtener las 3 primeras letras de la razón social
  const empresaPrefix = empresa.razonSocial
    .replace(/\s+/g, '') // Eliminar espacios
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .toUpperCase()
    .substring(0, 3);

  // 3. Construir el prefijo del código
  const prefix = `OC${empresaPrefix}`;

  // 4. Buscar la última orden de compra con este prefijo
  const lastOrder = await prisma.ordenCompra.findFirst({
    where: {
      codigoVenta: {
        startsWith: prefix
      }
    },
    orderBy: {
      codigoVenta: 'desc'
    }
  });

  // 5. Obtener el siguiente número
  let nextNumber = 1;
  if (lastOrder) {
    const lastNumber = parseInt(lastOrder.codigoVenta.replace(prefix, ''));
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  // 6. Generar el nuevo código
  return `${prefix}${nextNumber}`;
};
