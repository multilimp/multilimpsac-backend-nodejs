import prisma from '../../database/prisma';
import { EstadoPago } from '@prisma/client';

const estadoPago = EstadoPago.URGENTE;

export const getPagosUrgentes = async () => {
  const startTime = Date.now();
  try {
    const transportesPagoUrgentes = await prisma.transporteAsignado.findMany({
      where: {
        estadoPago: estadoPago,
      },
      select: {
        id: true,
        codigoTransporte: true,
        montoFlete: true,
        createdAt: true,
        updatedAt: true,
        estadoPago: true,
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
            proveedorId: true,
            ordenCompra: {
              select: {
                cliente: {
                  select: {
                    id: true,
                    razonSocial: true,
                    ruc: true
                  }
                }
              }
            }
          }
        }
      },
      take: 50
    });

    // Consultar órdenes de proveedor con estado URGENTE
    const ordenesProveedorPagoUrgentes = await prisma.ordenProveedor.findMany({
      where: {
        tipoPago: estadoPago
      },
      select: {
        id: true,
        codigoOp: true,
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
            codigoVenta: true,
            cliente: {
              select: {
                id: true,
                razonSocial: true,
                ruc: true
              }
            }
          }
        },
        createdAt: true,
        updatedAt: true,
        estadoOp: true,
        notaPago: true
      },
      take: 50
    });

    const tiempoRespuesta = Date.now() - startTime;
    return {
      success: true,
      data: {
        transportes: transportesPagoUrgentes,
        ordenesProveedor: ordenesProveedorPagoUrgentes
      },
      tiempoRespuesta
    };

  } catch (error) {
    console.error('❌ Error en getPagosUrgentes:', error);
    throw new Error('Error al obtener pagos urgentes');
  }
};

// Función para obtener pagos pendientes (versión básica) - Solo transportes asignados
export const getPagosPendientes = async () => {
  const startTime = Date.now();

  try {
    // Solo consultar transportes asignados
    const transportesPendientes = await prisma.transporteAsignado.findMany({
      where: {
        estadoPago: EstadoPago.PENDIENTE
      },
      select: {
        id: true,
        codigoTransporte: true,
        montoFlete: true,
        createdAt: true,
        updatedAt: true,
        estadoPago: true,
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
            ordenCompra: {
              select: {
                cliente: {
                  select: {
                    id: true,
                    razonSocial: true,
                    ruc: true
                  }
                }
              }
            }
          }
        }
      },
      take: 100
    });

    // Consultar órdenes de proveedor con estado PENDIENTE
    const ordenesProveedorPendientes = await prisma.ordenProveedor.findMany({
      where: {
        tipoPago: EstadoPago.PENDIENTE
      },
      select: {
        id: true,
        codigoOp: true,
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
            codigoVenta: true,
            cliente: {
              select: {
                id: true,
                razonSocial: true,
                ruc: true
              }
            }
          }
        },
        createdAt: true,
        updatedAt: true,
        estadoOp: true,
        notaPago: true
      },
      take: 100
    });

    const tiempoRespuesta = Date.now() - startTime;

    return {
      success: true,
      data: {
        transportes: transportesPendientes,
        ordenesProveedor: ordenesProveedorPendientes
      },
      tiempoRespuesta
    };

  } catch (error) {
    console.error('❌ Error en getPagosPendientes:', error);
    throw new Error('Error al obtener pagos pendientes');
  }
};
