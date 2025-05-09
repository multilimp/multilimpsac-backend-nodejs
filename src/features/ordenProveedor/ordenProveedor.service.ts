import { OrdenProveedor, Prisma } from '@prisma/client';
import prisma from '../../database/prisma';

type CreateOrdenProveedorData = Omit<OrdenProveedor, 'id' | 'createdAt' | 'updatedAt'> & {
  productos?: Prisma.OpProductoCreateNestedManyWithoutOrdenProveedorInput;
  transportesAsignados?: Prisma.TransporteAsignadoCreateNestedManyWithoutOrdenProveedorInput;
  pagos?: Prisma.PagoOrdenProveedorCreateNestedManyWithoutOrdenProveedorInput;
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

export const createOrdenProveedor = (data: CreateOrdenProveedorData): Promise<OrdenProveedor> => {
   if (!data.codigoOp) {
    throw new Error('Falta el campo requerido: codigoOp.');
    }
  const processedData = processOrdenProveedorData(data);
  return prisma.ordenProveedor.create({
    data: processedData as any,
    include: { // Incluir relaciones al crear si se desea devolverlas
      productos: true,
      pagos: true,
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

