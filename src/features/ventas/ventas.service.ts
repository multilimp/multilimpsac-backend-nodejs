import { OrdenCompra, Prisma } from '@prisma/client';
import prisma from '../../database/prisma';
import * as ocService from '../../modules/ordenCompra/ordenCompra.service';

export const getAllVentas = async (
  page: number,
  pageSize: number,
  filters?: {
    clienteId?: number;
    minPrice?: number;
    maxPrice?: number;
    fechaFrom?: string;
    fechaTo?: string;
    search?: string;
  }
): Promise<{ data: OrdenCompra[]; total: number; totalPages: number }> => {
  const skip = (page - 1) * pageSize;

  const where: Prisma.OrdenCompraWhereInput = {};

  if (filters?.clienteId) where.clienteId = filters.clienteId;
  if (filters?.minPrice || filters?.maxPrice) {
    where.montoVenta = {};
    if (filters.minPrice) where.montoVenta.gte = filters.minPrice;
    if (filters.maxPrice) where.montoVenta.lte = filters.maxPrice;
  }
  if (filters?.fechaFrom || filters?.fechaTo) {
    where.fechaEmision = {};
    if (filters.fechaFrom) where.fechaEmision.gte = new Date(filters.fechaFrom);
    if (filters.fechaTo) where.fechaEmision.lte = new Date(filters.fechaTo);
  }
  if (filters?.search) {
    where.OR = [
      { codigoVenta: { contains: filters.search, mode: 'insensitive' } },
      { cliente: { razonSocial: { contains: filters.search, mode: 'insensitive' } } }
    ];
  }
  where.estadoActivo = true;
  const total = await ocService.getAllOrdenesCompra({ where }).then(list => list.length);

  const args: Prisma.OrdenCompraFindManyArgs = {
    where,
    skip,
    take: pageSize,
    orderBy: { id: 'desc' },
    include: {
      empresa: true,
      cliente: true,
      contactoCliente: true,
      catalogoEmpresa: true,
      ordenesProveedor: true
    }
  };

  const data = await ocService.getAllOrdenesCompra(args);
  const totalPages = Math.ceil(total / pageSize);

  return { data, total, totalPages };
};

export const getVentaById = (
  id: number
): Promise<OrdenCompra | null> => {
  return prisma.ordenCompra.findUnique({
    where: { id },
    include: {
      empresa: true,
      cliente: true,
      contactoCliente: true,
      catalogoEmpresa: true,
      ordenesProveedor: true,
      ordenCompraPrivada: true,
      facturaciones: true,
      gestionCobranzas: true,
      OrdenCompraAgrupada: true
    }
  });
};

export const createVenta = async (
  data: Prisma.OrdenCompraCreateInput
): Promise<OrdenCompra> => {
  return ocService.createOrdenCompra({
    ...data,
    etapaActual: data.etapaActual ?? 'creacion',
    estadoActivo: data.estadoActivo ?? true
  });
};


export const updateVenta = (
  id: number,
  data: Prisma.OrdenCompraUpdateInput
): Promise<OrdenCompra> => {
  return ocService.updateOrdenCompra(id, data);
};

export const deleteVenta = (
  id: number
): Promise<OrdenCompra> => {
  return ocService.updateOrdenCompra(id, { estadoActivo: false });
};
