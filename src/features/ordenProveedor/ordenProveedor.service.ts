import { OrdenProveedor, Prisma } from '@prisma/client';
import prisma from '../../database/prisma';

type CreateOrdenProveedorData = Omit<OrdenProveedor, 'id' | 'createdAt' | 'updatedAt'> & {
  productos?: Prisma.OpProductoCreateNestedManyWithoutOrdenProveedorInput;
  transportesAsignados?: Prisma.TransporteAsignadoCreateNestedManyWithoutOrdenProveedorInput;
};

type UpdateOrdenProveedorData = Partial<Omit<OrdenProveedor, 'id' | 'createdAt' | 'updatedAt'>> & {
  productos?: Prisma.OpProductoUpdateManyWithoutOrdenProveedorNestedInput;
  transportesAsignados?: Prisma.TransporteAsignadoUpdateManyWithoutOrdenProveedorNestedInput;
  pagos?: Prisma.PagoOrdenProveedorUpdateManyWithoutOrdenProveedorNestedInput;
};

// Función auxiliar para procesar datos (fechas, Decimal)
const processOrdenProveedorData = (data: any) => {
  if (data.fechaDespacho && typeof data.fechaDespacho === 'string') {
    data.fechaDespacho = new Date(data.fechaDespacho);
  }
  if (data.fechaProgramada && typeof data.fechaProgramada === 'string') {
    data.fechaProgramada = new Date(data.fechaProgramada);
  }
  if (data.fechaRecepcion && typeof data.fechaRecepcion === 'string') {
    data.fechaRecepcion = new Date(data.fechaRecepcion);
  }
  // No convertir fechaEntrega si es string por definición en schema

  if (data.totalProveedor && typeof data.totalProveedor !== 'object') {
    data.totalProveedor = new Prisma.Decimal(data.totalProveedor);
  }

  return data;
};

const generateCodigoOp = async (id: number): Promise<string> => {
  const oc = await prisma.ordenCompra.findUnique({
    where: { id },
    select: { codigoVenta: true },
  });

  if (!oc) throw new Error('Orden de compra no encontrada');

  const match = oc.codigoVenta.match(/OC(\w+)/);
  if (!match) throw new Error('Formato de OC inválido');

  const base = match[1];

  const existingOps = await prisma.ordenProveedor.findMany({
    where: {
      codigoOp: {
        startsWith: `OP${base}-`,
      },
    },
    select: { codigoOp: true },
  });

  // Extrae los números al final de cada OP, y encuentra el máximo
  let maxSuffix = 0;
  for (const op of existingOps) {
    const match = op.codigoOp.match(new RegExp(`^OP${base}-(\\d+)$`));
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxSuffix) maxSuffix = num;
    }
  }

  // Genera nuevo código con número incrementado
  const newSuffix = maxSuffix + 1;
  return `OP${base}-${newSuffix}`;
};

const generateCodigoTransporte = async (ordenProveedorId: number): Promise<string> => {
  const existing = await prisma.transporteAsignado.findMany({
    where: { ordenProveedorId: ordenProveedorId },
    select: { codigoTransporte: true },
  });
  let maxSuffix = 0;
  for (const t of existing) {
    const match = t.codigoTransporte.match(new RegExp(`^TR${ordenProveedorId}-(\\d+)$`));
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxSuffix) maxSuffix = num;
    }
  }
  const newSuffix = maxSuffix + 1;
  return `TR${ordenProveedorId}-${newSuffix}`;
};

export const getOrdenesProveedorByOrdenCompraId = async (ordenCompraId: number): Promise<OrdenProveedor[]> => {
  return prisma.ordenProveedor.findMany({
    where: { ordenCompraId },
    include: {
      empresa: true,
      proveedor: true,
      contactoProveedor: true,
      ordenCompra: true,
      productos: true,
      pagos: true,
      transportesAsignados: { include: { transporte: true, contactoTransporte: true, pagos: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getCodigosOrdenesProveedor = (): Promise<Array<Pick<OrdenProveedor, 'codigoOp' | 'id'>>> => {
  return prisma.ordenProveedor.findMany({ select: { codigoOp: true, id: true } });
};

export const getAllOrdenesProveedor = (): Promise<OrdenProveedor[]> => {
  return prisma.ordenProveedor.findMany({
    include: {
      empresa: true,
      proveedor: true,
      contactoProveedor: true,
      ordenCompra: true,
      productos: true,
      pagos: true,
      transportesAsignados: { include: { transporte: true, contactoTransporte: true, pagos: true } },
    },
  });
};

export const getOrdenProveedorById = (id: number): Promise<OrdenProveedor | null> => {
  return prisma.ordenProveedor.findUnique({
    where: { id },
    include: {
      empresa: true,
      proveedor: true,
      contactoProveedor: true,
      ordenCompra: true,
      productos: true,
      pagos: true,
      transportesAsignados: { include: { transporte: true, contactoTransporte: true, pagos: true } },
    },
  });
};

export const createOrdenProveedor = async (id: number, data: CreateOrdenProveedorData): Promise<OrdenProveedor> => {
  const codigoOp = await generateCodigoOp(id);
  const processedData = processOrdenProveedorData({ ...data, codigoOp });
  if (processedData.transportesAsignados && Array.isArray(processedData.transportesAsignados.create)) {
    for (let i = 0; i < processedData.transportesAsignados.create.length; i++) {
      processedData.transportesAsignados.create[i].codigoTransporte = await generateCodigoTransporte(id);
    }
  }
  return prisma.ordenProveedor.create({
    data: processedData as CreateOrdenProveedorData,
    include: {
      productos: true,
      transportesAsignados: true,
    },
  });
};

export const updateOrdenProveedor = (id: number, data: UpdateOrdenProveedorData): Promise<OrdenProveedor> => {
  const processedData = processOrdenProveedorData(data);
  return prisma.ordenProveedor.update({
    where: { id },
    data: processedData as any,
    include: {
      productos: true,
      pagos: true,
      transportesAsignados: true,
    },
  });
};

export const deleteOrdenProveedor = (id: number): Promise<OrdenProveedor> => {
  return prisma.ordenProveedor.delete({
    where: { id },
    include: {
      productos: true,
      pagos: true,
      transportesAsignados: true,
    },
  });
};
