/**
 * TESORERÍA SERVICE - GESTIÓN COMPLETA DE PAGOS
 * =============================================
 * 
 * 🎯 SERVICIOS IMPLEMENTADOS:
 * 
 * 1. getPagosUrgentes():
 *    - Obtiene solo pagos con estado URGENTE
 *    - Para sistema de notificaciones flotantes
 *    - Formato consolidado con estadísticas
 * 
 * 2. getPagosPorEstado(): ⭐ NUEVO DASHBOARD
 *    - Obtiene TODOS los pagos (URGENTE + PENDIENTE)
 *    - Datos completos para dashboard de tesorería
 *    - Incluye transportes y ventas privadas
 *    - Formateo consistente y ordenamiento por fecha
 * 
 * 📊 MODELOS CONSULTADOS:
 * - TransporteAsignado (estadoPago: URGENTE/PENDIENTE)
 * - OrdenCompraPrivada (estadoPago: URGENTE/PENDIENTE)
 * 
 * 🔗 RELACIONES INCLUIDAS:
 * - ordenProveedor → ordenCompra → cliente/empresa
 * - transporte (razón social, RUC)
 * - Metadatos: fechas, montos, códigos, notas
 * 
 * ✨ CARACTERÍSTICAS:
 * - Queries optimizados con includes específicos
 * - Formateo consistente de datos
 * - Ordenamiento por fechas de vencimiento
 * - Estadísticas agregadas automáticas
 * - Manejo robusto de errores
 */

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
  } if (pagos && Array.isArray(pagos)) {
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
  } if (pago) {
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

// ✅ NUEVA FUNCIÓN: Obtener todos los pagos urgentes para notificaciones
export const getPagosUrgentes = async () => {
  try {
    // Obtener Transportes Asignados con estado URGENTE
    const transportesUrgentes = await prisma.transporteAsignado.findMany({
      where: {
        estadoPago: 'URGENTE'
      },
      select: {
        id: true,
        codigoTransporte: true,
        montoFlete: true,
        notaPago: true,
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
            fechaProgramada: true
          }
        },
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Obtener Ventas Privadas con estado URGENTE
    const ventasPrivadasUrgentes = await prisma.ordenCompraPrivada.findMany({
      where: {
        estadoPago: 'URGENTE'
      },
      select: {
        id: true,
        notaPago: true,
        ordenCompra: {
          select: {
            id: true,
            codigoVenta: true,
            montoVenta: true,
            fechaMaxForm: true,
            empresa: {
              select: {
                id: true,
                razonSocial: true,
                ruc: true
              }
            }
          }
        },
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Formatear respuesta consolidada
    const pagosUrgentes = {
      transportes: transportesUrgentes.map(transporte => ({
        id: transporte.id,
        tipo: 'TRANSPORTE',
        codigo: `${transporte.ordenProveedor.codigoOp}-${transporte.codigoTransporte}`,
        monto: transporte.montoFlete,
        fechaLimite: transporte.ordenProveedor.fechaProgramada,
        entidad: {
          id: transporte.transporte.id,
          nombre: transporte.transporte.razonSocial,
          ruc: transporte.transporte.ruc
        },
        descripcion: `Flete OP ${transporte.ordenProveedor.codigoOp} - ${transporte.transporte.razonSocial}`,
        notaPago: transporte.notaPago,
        createdAt: transporte.createdAt,
        updatedAt: transporte.updatedAt
      })),
      ventasPrivadas: ventasPrivadasUrgentes.map(venta => ({
        id: venta.id,
        tipo: 'VENTA_PRIVADA',
        codigo: venta.ordenCompra.codigoVenta,
        monto: venta.ordenCompra.montoVenta,
        fechaLimite: venta.ordenCompra.fechaMaxForm,
        entidad: {
          id: venta.ordenCompra.empresa?.id || 0,
          nombre: venta.ordenCompra.empresa?.razonSocial || 'Sin empresa',
          ruc: venta.ordenCompra.empresa?.ruc || 'Sin RUC'
        },
        descripcion: `Venta ${venta.ordenCompra.codigoVenta} - ${venta.ordenCompra.empresa?.razonSocial || 'Sin empresa'}`,
        notaPago: venta.notaPago,
        createdAt: venta.createdAt,
        updatedAt: venta.updatedAt
      }))
    };

    // Calcular estadísticas
    const totalTransportes = transportesUrgentes.length;
    const totalVentas = ventasPrivadasUrgentes.length;
    const totalUrgentes = totalTransportes + totalVentas;

    const montoTotalTransportes = transportesUrgentes.reduce((sum, t) => sum + Number(t.montoFlete || 0), 0);
    const montoTotalVentas = ventasPrivadasUrgentes.reduce((sum, v) => sum + Number(v.ordenCompra.montoVenta || 0), 0);
    const montoTotal = montoTotalTransportes + montoTotalVentas;

    return {
      success: true,
      data: pagosUrgentes,
      estadisticas: {
        totalUrgentes,
        totalTransportes,
        totalVentas,
        montoTotal,
        montoTotalTransportes,
        montoTotalVentas
      }
    };

  } catch (error) {
    console.error('Error al obtener pagos urgentes:', error);
    throw new Error(`Error al obtener pagos urgentes: ${error}`);
  }
};

export const getPagosPorEstado = async () => {
  try {
    // Obtener transportes por estado
    const transportesPendientes = await prisma.transporteAsignado.findMany({
      where: {
        estadoPago: 'PENDIENTE'
      },
      include: {
        ordenProveedor: {
          include: {
            ordenCompra: {
              include: {
                cliente: true,
                contactoCliente: true,
                empresa: true
              }
            }
          }
        },
        transporte: true
      }
    });

    const transportesUrgentes = await prisma.transporteAsignado.findMany({
      where: {
        estadoPago: 'URGENTE'
      },
      include: {
        ordenProveedor: {
          include: {
            ordenCompra: {
              include: {
                cliente: true,
                contactoCliente: true,
                empresa: true
              }
            }
          }
        },
        transporte: true
      }
    });

    // Obtener órdenes de compra privadas por estado
    const ventasPrivadasPendientes = await prisma.ordenCompraPrivada.findMany({
      where: {
        estadoPago: 'PENDIENTE'
      },
      include: {
        ordenCompra: {
          include: {
            cliente: true,
            contactoCliente: true,
            empresa: true
          }
        }
      }
    });

    const ventasPrivadasUrgentes = await prisma.ordenCompraPrivada.findMany({
      where: {
        estadoPago: 'URGENTE'
      },
      include: {
        ordenCompra: {
          include: {
            cliente: true,
            contactoCliente: true,
            empresa: true
          }
        }
      }
    });

    // Formatear datos con estructura consistente
    const formatearTransportes = (transportes: any[]) => {
      return transportes.map(transporte => ({
        id: transporte.id,
        tipo: 'TRANSPORTE',
        codigo: `${transporte.ordenProveedor?.codigoOp || ''}-${transporte.codigoTransporte}`,
        cliente: transporte.ordenProveedor?.ordenCompra?.cliente?.razonSocial || '',
        transporteRazonSocial: transporte.transporte?.razonSocial || '',
        monto: Number(transporte.montoFlete || 0),
        fechaVencimiento: transporte.ordenProveedor?.fechaProgramada,
        estadoPago: transporte.estadoPago,
        notaPago: transporte.notaPago,
        fechaCreacion: transporte.createdAt,
        grt: transporte.grt,
        region: transporte.region,
        provincia: transporte.provincia,
        distrito: transporte.distrito,
        descripcion: `Flete OP ${transporte.ordenProveedor?.codigoOp || ''} - ${transporte.transporte?.razonSocial || ''}`
      }));
    };

    const formatearVentasPrivadas = (ventas: any[]) => {
      return ventas.map(venta => ({
        id: venta.id,
        tipo: 'VENTA_PRIVADA',
        codigo: venta.ordenCompra?.codigoVenta || '',
        cliente: venta.ordenCompra?.cliente?.razonSocial || '',
        monto: Number(venta.ordenCompra?.montoVenta || 0),
        fechaVencimiento: venta.fechaPago || venta.ordenCompra?.fechaMaxForm,
        estadoPago: venta.estadoPago,
        notaPago: venta.notaPago,
        fechaCreacion: venta.createdAt,
        documentoPago: venta.documentoPago,
        documentoCotizacion: venta.documentoCotizacion,
        descripcion: `Venta Privada ${venta.ordenCompra?.codigoVenta || ''} - ${venta.ordenCompra?.cliente?.razonSocial || ''}`
      }));
    };

    // Formatear todos los pagos
    const pagosPendientes = [
      ...formatearTransportes(transportesPendientes),
      ...formatearVentasPrivadas(ventasPrivadasPendientes)
    ];

    const pagosUrgentes = [
      ...formatearTransportes(transportesUrgentes),
      ...formatearVentasPrivadas(ventasPrivadasUrgentes)
    ];

    // Calcular estadísticas
    const estadisticas = {
      pendientes: {
        total: pagosPendientes.length,
        transportes: transportesPendientes.length,
        ventasPrivadas: ventasPrivadasPendientes.length,
        montoTotal: pagosPendientes.reduce((sum, p) => sum + p.monto, 0)
      },
      urgentes: {
        total: pagosUrgentes.length,
        transportes: transportesUrgentes.length,
        ventasPrivadas: ventasPrivadasUrgentes.length,
        montoTotal: pagosUrgentes.reduce((sum, p) => sum + p.monto, 0)
      }
    };

    return {
      success: true,
      data: {
        pendientes: pagosPendientes.sort((a, b) => {
          const fechaA = new Date(a.fechaVencimiento || 0).getTime();
          const fechaB = new Date(b.fechaVencimiento || 0).getTime();
          return fechaA - fechaB;
        }),
        urgentes: pagosUrgentes.sort((a, b) => {
          const fechaA = new Date(a.fechaVencimiento || 0).getTime();
          const fechaB = new Date(b.fechaVencimiento || 0).getTime();
          return fechaA - fechaB;
        })
      },
      estadisticas
    };

  } catch (error) {
    console.error('Error al obtener pagos por estado:', error);
    throw new Error(`Error al obtener pagos por estado: ${error}`);
  }
};
