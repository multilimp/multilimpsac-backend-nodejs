import { Prisma } from '@prisma/client';
import prisma from '../../database/prisma';

type EstadoPago = 'PAGADO' | 'URGENTE' | 'PENDIENTE';

type UpdateOpData = {
  estadoPago?: EstadoPago;
  notaPago?: string;
};

type UpdateTransporteAsignadoData = {
  estadoPago?: EstadoPago;
  notaPago?: string;
};

type CreatePagoOpData = {
  fechaPago?: string | Date;
  bancoPago?: string;
  descripcionPago?: string;
  archivoPago?: string;
  montoPago?: number | string;
  estadoPago?: boolean;
  activo?: boolean;
};

type UpdatePagoOpData = CreatePagoOpData & {
  id: number;
};

type CreatePagoTransporteData = {
  fechaPago?: string | Date;
  bancoPago?: string;
  descripcionPago?: string;
  archivoPago?: string;
  montoPago?: number | string;
  estadoPago?: boolean;
  activo?: boolean;
};

type UpdatePagoTransporteData = CreatePagoTransporteData & {
  id: number;
};

type CreatePagoVentaPrivadaData = {
  fechaPago?: string | Date;
  bancoPago?: string;
  descripcionPago?: string;
  archivoPago?: string;
  montoPago?: number | string;
  estadoPago?: boolean;
  activo?: boolean;
};

type UpdatePagoVentaPrivadaData = CreatePagoVentaPrivadaData & {
  id: number;
};

type TesoreriaOpData = {
  ordenProveedorId: number;
  updatesForOrdenProveedor?: UpdateOpData;
  pagos?: (CreatePagoOpData | UpdatePagoOpData)[];
};

type TesoreriaTransporteData = {
  transporteAsignadoId: number;
  updatesForTransporteAsignado?: UpdateTransporteAsignadoData;
  pagos?: (CreatePagoTransporteData | UpdatePagoTransporteData)[];
};

type TesoreriaVentaPrivadaData = {
  ordenCompraPrivadaId: number;
  updatesForOrdenProveedor?: UpdateOpData;
  pago?: CreatePagoVentaPrivadaData | UpdatePagoVentaPrivadaData;
};

const processDecimalFields = (data: any, fields: string[]) => {
  fields.forEach(field => {
    if (data[field] !== undefined && data[field] !== null && typeof data[field] !== 'object') {
      data[field] = new Prisma.Decimal(data[field]);
    }
  });
  return data;
};

const processDateFields = (data: any, fields: string[]) => {
  fields.forEach(field => {
    if (data[field] && typeof data[field] === 'string') {
      data[field] = new Date(data[field]);
    }
  });
  return data;
};

const processPagoOpData = (pago: CreatePagoOpData | UpdatePagoOpData) => {
  let processedData = { ...pago };
  processedData = processDateFields(processedData, ['fechaPago']);
  processedData = processDecimalFields(processedData, ['montoPago']);
  return processedData;
};

const processPagoTransporteData = (pago: CreatePagoTransporteData | UpdatePagoTransporteData) => {
  let processedData = { ...pago };
  processedData = processDateFields(processedData, ['fechaPago']);
  processedData = processDecimalFields(processedData, ['montoPago']);
  return processedData;
};

const processPagoVentaPrivadaData = (pago: CreatePagoVentaPrivadaData | UpdatePagoVentaPrivadaData) => {
  let processedData = { ...pago };
  processedData = processDateFields(processedData, ['fechaPago']);
  processedData = processDecimalFields(processedData, ['montoPago']);
  return processedData;
};

export const processTesoreriaOp = async (data: TesoreriaOpData) => {
  const { ordenProveedorId, updatesForOrdenProveedor, pagos } = data;

  if (!ordenProveedorId) {
    throw new Error('ordenProveedorId es requerido');
  }

  const ordenProveedor = await prisma.ordenProveedor.findUnique({
    where: { id: ordenProveedorId },
    include: { pagos: true }
  });

  if (!ordenProveedor) {
    throw new Error('Orden de proveedor no encontrada');
  }

  const transactionOperations = [];

  if (updatesForOrdenProveedor) {
    transactionOperations.push(
      prisma.ordenProveedor.update({
        where: { id: ordenProveedorId },
        data: updatesForOrdenProveedor
      })
    );
  }  if (pagos && Array.isArray(pagos)) {
    for (const pago of pagos) {
      const processedPago = processPagoOpData(pago);
      
      if ('id' in pago && (pago as any).id) {
        const { id, ...updateData } = processedPago as any;
        transactionOperations.push(
          prisma.pagoOrdenProveedor.update({
            where: { id: (pago as any).id },
            data: updateData
          })
        );
      } else {
        const { id, ...createData } = processedPago as any;
        transactionOperations.push(
          prisma.pagoOrdenProveedor.create({
            data: {
              ...createData,
              ordenProveedorId
            }
          })
        );
      }
    }
  }

  return prisma.$transaction(transactionOperations);
};

export const processTesoreriaTransporte = async (data: TesoreriaTransporteData) => {
  const { transporteAsignadoId, updatesForTransporteAsignado, pagos } = data;

  if (!transporteAsignadoId) {
    throw new Error('transporteAsignadoId es requerido');
  }

  const transporteAsignado = await prisma.transporteAsignado.findUnique({
    where: { id: transporteAsignadoId },
    include: { pagos: true }
  });

  if (!transporteAsignado) {
    throw new Error('Transporte asignado no encontrado');
  }

  const transactionOperations = [];

  if (updatesForTransporteAsignado) {
    transactionOperations.push(
      prisma.transporteAsignado.update({
        where: { id: transporteAsignadoId },
        data: updatesForTransporteAsignado
      })
    );
  }
  if (pagos && Array.isArray(pagos)) {
    for (const pago of pagos) {
      const processedPago = processPagoTransporteData(pago);
      
      if ('id' in pago && (pago as any).id) {
        const { id, ...updateData } = processedPago as any;
        transactionOperations.push(
          prisma.pagoTransporteAsignado.update({
            where: { id: (pago as any).id },
            data: updateData
          })
        );
      } else {
        const { id, ...createData } = processedPago as any;
        transactionOperations.push(
          prisma.pagoTransporteAsignado.create({
            data: {
              ...createData,
              transporteAsignadoId
            }
          })
        );
      }
    }
  }

  return prisma.$transaction(transactionOperations);
};

export const processTesoreriaVentaPrivada = async (data: TesoreriaVentaPrivadaData) => {
  const { ordenCompraPrivadaId, updatesForOrdenProveedor, pago } = data;

  if (!ordenCompraPrivadaId) {
    throw new Error('ordenCompraPrivadaId es requerido');
  }
  const ordenCompraPrivada = await prisma.ordenCompraPrivada.findUnique({
    where: { id: ordenCompraPrivadaId },
    include: { pagos: true }
  });

  if (!ordenCompraPrivada) {
    throw new Error('Orden de compra privada no encontrada');
  }

  const transactionOperations = [];

  if (updatesForOrdenProveedor) {
    transactionOperations.push(
      prisma.ordenCompraPrivada.update({
        where: { id: ordenCompraPrivadaId },
        data: updatesForOrdenProveedor
      })
    );
  }  if (pago) {
    const processedPago = processPagoVentaPrivadaData(pago);
    
    if ('id' in pago && (pago as any).id) {
      const { id, ...updateData } = processedPago as any;
      transactionOperations.push(
        prisma.pagoOrdenCompraPrivada.update({
          where: { id: (pago as any).id },
          data: updateData
        })
      );
    } else {
      const { id, ...createData } = processedPago as any;
      transactionOperations.push(
        prisma.pagoOrdenCompraPrivada.create({
          data: {
            ...createData,
            ordenCompraPrivadaId
          }
        })
      );
    }
  }

  return prisma.$transaction(transactionOperations);
};

export const getOrdenProveedorWithPagos = async (ordenProveedorId: number) => {
  if (isNaN(ordenProveedorId)) {
    throw new Error('El ID de la orden de proveedor debe ser un número.');
  }
  
  return prisma.ordenProveedor.findUnique({
    where: { id: ordenProveedorId },
    include: {
      pagos: {
        where: { activo: true },
        orderBy: { createdAt: 'desc' }
      },
      proveedor: {
        select: {
          id: true,
          razonSocial: true,
          ruc: true
        }
      },
      ordenCompra: {
        select: {
          id: true,
          codigoVenta: true
        }
      }
    }
  });
};

export const getTransporteAsignadoWithPagos = async (transporteAsignadoId: number) => {
  if (isNaN(transporteAsignadoId)) {
    throw new Error('El ID del transporte asignado debe ser un número.');
  }
  
  return prisma.transporteAsignado.findUnique({
    where: { id: transporteAsignadoId },
    include: {
      pagos: {
        where: { activo: true },
        orderBy: { createdAt: 'desc' }
      },
      transporte: {
        select: {
          id: true,
          razonSocial: true,
          ruc: true
        }
      },
      ordenProveedor: {
        select: {
          id: true,
          codigoOp: true,
          ordenCompra: {
            select: {
              id: true,
              codigoVenta: true
            }
          }
        }
      }
    }
  });
};

export const getTransportesByOrdenCompra = async (ordenCompraId: number) => {
  if (isNaN(ordenCompraId)) {
    throw new Error('El ID de la orden de compra debe ser un número.');
  }
  
  return prisma.transporteAsignado.findMany({
    where: {
      ordenProveedor: {
        ordenCompraId: ordenCompraId
      }
    },
    include: {
      pagos: {
        where: { activo: true },
        orderBy: { createdAt: 'desc' }
      },
      transporte: {
        select: {
          id: true,
          razonSocial: true,
          ruc: true
        }
      },
      ordenProveedor: {
        select: {
          id: true,
          codigoOp: true,
          proveedor: {
            select: {
              id: true,
              razonSocial: true,
              ruc: true
            }
          }
        }
      }
    }
  });
};
