import { OrdenCompra, Prisma } from '@prisma/client';
import prisma from '../../database/prisma';

export const getAllOrdenesCompra = (args?: Prisma.OrdenCompraFindManyArgs): Promise<OrdenCompra[]> => {
  // Si no se especifica orderBy, usar ordenamiento descendente por fecha de creación
  const defaultArgs: Prisma.OrdenCompraFindManyArgs = {
    orderBy: { createdAt: 'desc' },
    ...args
  };
  
  return prisma.ordenCompra.findMany(defaultArgs);
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

export const patchOrdenCompra = (id: number, data: Partial<Prisma.OrdenCompraUpdateInput>): Promise<OrdenCompra> => {
  const processedData: Prisma.OrdenCompraUpdateInput = { ...data };
  
  if (data.fechaEmision && typeof data.fechaEmision === 'string') {
    processedData.fechaEmision = new Date(data.fechaEmision);
  }
  
  if (data.fechaEntregaOc && typeof data.fechaEntregaOc === 'string') {
    processedData.fechaEntregaOc = new Date(data.fechaEntregaOc);
  }
  
  if (data.fechaPeruCompras && typeof data.fechaPeruCompras === 'string') {
    processedData.fechaPeruCompras = new Date(data.fechaPeruCompras);
  }
  
  if (data.fechaEntrega && typeof data.fechaEntrega === 'string') {
    processedData.fechaEntrega = new Date(data.fechaEntrega);
  }
  
  if (data.fechaForm && typeof data.fechaForm === 'string') {
    processedData.fechaForm = new Date(data.fechaForm);
  }
  
  if (data.fechaMaxForm && typeof data.fechaMaxForm === 'string') {
    processedData.fechaMaxForm = new Date(data.fechaMaxForm);
  }
  
  if (data.fechaSiaf && typeof data.fechaSiaf === 'string') {
    processedData.fechaSiaf = new Date(data.fechaSiaf);
  }
  
  if (data.fechaEstadoCobranza && typeof data.fechaEstadoCobranza === 'string') {
    processedData.fechaEstadoCobranza = new Date(data.fechaEstadoCobranza);
  }
  
  if (data.fechaProximaGestion && typeof data.fechaProximaGestion === 'string') {
    processedData.fechaProximaGestion = new Date(data.fechaProximaGestion);
  }
  
  return prisma.ordenCompra.update({
    where: { id },
    data: processedData,
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
