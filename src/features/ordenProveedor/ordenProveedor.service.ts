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
    select: { 
      codigoVenta: true,
      empresa: {
        select: {
          razonSocial: true
        }
      }
    },
  });

  if (!oc) throw new Error('Orden de compra no encontrada');
  if (!oc.empresa) throw new Error('La orden de compra no tiene empresa asociada');

  // ✅ CORRECCIÓN: Manejar el formato real del sistema OC-2025-001, OCP-2025-001, etc.
  // Extraer las 3 primeras letras de la razón social de la empresa
  const empresaPrefix = oc.empresa.razonSocial
    .replace(/\s+/g, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .substring(0, 3);

  // ✅ CORRECCIÓN: Buscar OPs existentes con el patrón OP[EMP][ID]-
  const basePattern = `OP${empresaPrefix}${id}-`;
  
  const existingOps = await prisma.ordenProveedor.findMany({
    where: {
      codigoOp: {
        startsWith: basePattern,
      },
    },
    select: { codigoOp: true },
  });

  // ✅ CORRECCIÓN: Extraer el número secuencial correctamente
  let maxSuffix = 0;
  for (const op of existingOps) {
    const opMatch = op.codigoOp.match(new RegExp(`^${basePattern}(\\d+)$`));
    if (opMatch) {
      const num = parseInt(opMatch[1], 10);
      if (num > maxSuffix) maxSuffix = num;
    }
  }

  // ✅ RESULTADO: OPMUL1-1, OPMUL1-2, OPMUL2-1, etc.
  const newSuffix = maxSuffix + 1;
  return `${basePattern}${newSuffix}`;
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
    where: {
      ordenCompraId,
      activo: true,
    },
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

export const getCodigosOrdenesProveedor = (ordenCompraId: number): Promise<Array<Pick<OrdenProveedor, 'codigoOp' | 'id'>>> => {
  return prisma.ordenProveedor.findMany({
    where: {
      ordenCompraId,
      activo: true,
    },
    select: { codigoOp: true, id: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const getAllOrdenesProveedor = (): Promise<OrdenProveedor[]> => {
  return prisma.ordenProveedor.findMany({
    where: { activo: true },
    include: {
      empresa: true,
      proveedor: true,
      contactoProveedor: true,
      ordenCompra: true,
      productos: true,
      pagos: true,
      transportesAsignados: { include: { transporte: true, contactoTransporte: true, pagos: true } },
    },
    orderBy: { createdAt: 'desc' }, // Ordenamiento descendente por fecha de creación
  });
};

export const getOrdenProveedorById = (id: number): Promise<OrdenProveedor | null> => {
  return prisma.ordenProveedor.findFirst({
    where: {
      id,
      activo: true,
    },
    include: {
      empresa: true,
      proveedor: true,
      contactoProveedor: true,
      ordenCompra: {
        include: {
          cliente: true,
          contactoCliente: true,
        },
      },
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

export const updateOrdenProveedor = async (id: number, data: UpdateOrdenProveedorData): Promise<OrdenProveedor> => {
  const existing = await prisma.ordenProveedor.findFirst({
    where: { id, activo: true },
  });

  if (!existing) {
    throw new Error('NOT_FOUND');
  }

  const processedData = processOrdenProveedorData(data);
  
  // ✅ CORRECCIÓN: Generar códigos de transporte para operaciones de actualización
  if (processedData.transportesAsignados && processedData.transportesAsignados.create && Array.isArray(processedData.transportesAsignados.create)) {
    for (let i = 0; i < processedData.transportesAsignados.create.length; i++) {
      processedData.transportesAsignados.create[i].codigoTransporte = await generateCodigoTransporte(id);
    }
  }
  
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
  return prisma.ordenProveedor.update({
    where: { id },
    data: { activo: false },
    include: {
      productos: true,
      pagos: true,
      transportesAsignados: true,
    },
  });
};
