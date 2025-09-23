import prisma from '../../database/prisma';
import { EstadoPago } from '@prisma/client';

const estadoPago = EstadoPago.URGENTE;

export const getPagosUrgentes = async () => {
  const startTime = Date.now();
  try {
    console.log('🔍 Consultando pagos urgentes (solo transportes)...');
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
    console.log(`⏱️  Pagos urgentes: ${tiempoRespuesta}ms - ${transportesPagoUrgentes.length} transportes, ${ordenesProveedorPagoUrgentes.length} órdenes proveedor`);

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
    console.log('🔍 Consultando pagos pendientes (solo transportes)...');

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
        ordenProveedor: {
          select: {
            id: true,
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
      take: 100 // Más resultados para pendientes
    });

    // Consultar órdenes de proveedor con estado PENDIENTE
    const ordenesProveedorPendientes = await prisma.ordenProveedor.findMany({
      where: {
        tipoPago: EstadoPago.PENDIENTE
      },
      select: {
        id: true,
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
    console.log(`⏱️  Pagos pendientes: ${tiempoRespuesta}ms - ${transportesPendientes.length} transportes, ${ordenesProveedorPendientes.length} órdenes proveedor`);

    return {
      success: true,
      data: {
        transportes: transportesPendientes,
        ordenesProveedor: ordenesProveedorPendientes
      },
      estadisticas: {
        totalPendientes: transportesPendientes.length + ordenesProveedorPendientes.length,
        totalTransportes: transportesPendientes.length,
        totalOrdenesProveedor: ordenesProveedorPendientes.length,
        montoTotal: transportesPendientes.reduce((sum, t) => sum + Number(t.montoFlete || 0), 0),
        montoTotalTransportes: transportesPendientes.reduce((sum, t) => sum + Number(t.montoFlete || 0), 0),
        montoTotalOrdenesProveedor: 0 // Órdenes proveedor no tienen monto directo
      },
      tiempoRespuesta
    };

  } catch (error) {
    console.error('❌ Error en getPagosPendientes:', error);
    throw new Error('Error al obtener pagos pendientes');
  }
};

export const getPagosPorEstado = async (estado: 'URGENTE' | 'PENDIENTE') => {
  const startTime = Date.now();

  try {
    console.log(`🔍 Consultando pagos por estado: ${estado}...`);

    const estadoPagoEnum = estado === 'URGENTE' ? EstadoPago.URGENTE : EstadoPago.PENDIENTE;

    const [transportes, ordenesProveedor] = await Promise.all([
      prisma.transporteAsignado.findMany({
        where: {
          estadoPago: estadoPagoEnum
        },
        select: {
          id: true,
          codigoTransporte: true,
          montoFlete: true,
          createdAt: true,
          updatedAt: true,
          estadoPago: true,
          notaPago: true,
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
        take: estado === 'URGENTE' ? 50 : 100
      }),
      prisma.ordenProveedor.findMany({
        where: {
          tipoPago: estadoPagoEnum
        },
        select: {
          id: true,
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
        take: estado === 'URGENTE' ? 50 : 100
      })
    ]);

    const tiempoRespuesta = Date.now() - startTime;
    console.log(`⏱️  Pagos ${estado}: ${tiempoRespuesta}ms - ${transportes.length} transportes, ${ordenesProveedor.length} órdenes proveedor`);

    return {
      success: true,
      data: {
        transportes,
        ordenesProveedor
      },
      estadisticas: {
        total: transportes.length + ordenesProveedor.length,
        totalTransportes: transportes.length,
        totalOrdenesProveedor: ordenesProveedor.length,
        montoTotal: transportes.reduce((sum, t) => sum + Number(t.montoFlete || 0), 0),
        montoTotalTransportes: transportes.reduce((sum, t) => sum + Number(t.montoFlete || 0), 0),
        montoTotalOrdenesProveedor: 0,
        estado
      },
      tiempoRespuesta
    };

  } catch (error) {
    console.error(`❌ Error en getPagosPorEstado (${estado}):`, error);
    throw new Error(`Error al obtener pagos ${estado.toLowerCase()}`);
  }
};
