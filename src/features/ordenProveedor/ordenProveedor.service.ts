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
}

export const getOrdenesProveedorByOrdenCompraId = (ordenCompraId: number): Promise<OrdenProveedor[]> => {
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
}

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

export const generateUniqueOrdenProveedorCode = async (proveedorId: number): Promise<string> => {
  const proveedor = await prisma.proveedor.findUnique({ where: { id: proveedorId } });
  if (!proveedor) throw new Error('Proveedor no encontrado');
  
  const proveedorPrefix = proveedor.razonSocial
    .replace(/\s+/g, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .substring(0, 3);
    
  const prefix = `OP${proveedorId}-${proveedorPrefix}-`;
  let nextNumber = 1;
  let codigo: string = '';
  let exists = true;
  
  while (exists) {
    codigo = `${prefix}${nextNumber}`;
    const existing = await prisma.ordenProveedor.findFirst({ where: { codigoOp: codigo } });
    if (!existing) {
      exists = false;
    } else {
      nextNumber++;
    }
  }
  return codigo;
};

export const createOrdenProveedor = async (data: CreateOrdenProveedorData): Promise<OrdenProveedor> => {
  if (!data.proveedorId) {
    throw new Error('Se requiere el ID del proveedor');
  }
  
  if (!data.ordenCompraId) {
    throw new Error('Se requiere el ID de la orden de compra');
  }

  // Obtener la orden de compra para extraer la empresaId
  const ordenCompra = await prisma.ordenCompra.findUnique({
    where: { id: data.ordenCompraId },
    select: { empresaId: true }
  });

  if (!ordenCompra) {
    throw new Error(`Orden de compra con ID ${data.ordenCompraId} no encontrada`);
  }

  // Generar código único
  const codigoOp = await generateUniqueOrdenProveedorCode(data.proveedorId);
  
  const processedData = processOrdenProveedorData({
    ...data,
    empresaId: ordenCompra.empresaId,
    codigoOp
  });

  return prisma.ordenProveedor.create({
    data: processedData as any,
    include: {
      productos: true,
      transportesAsignados: true,
    }
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
    }
  });
};

