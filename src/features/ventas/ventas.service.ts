import { OrdenCompra, OrdenCompraPrivada, Prisma } from '@prisma/client';
import prisma from '../../database/prisma';
import * as ocService from '../../modules/ordenCompra/ordenCompra.service';
import { BaseVentaService } from '../../shared/services/baseVenta.service';
import logger from '../../shared/config/logger';

class VentaService extends BaseVentaService<OrdenCompra, Prisma.OrdenCompraCreateInput, Prisma.OrdenCompraUpdateInput> {
  protected model = prisma.ordenCompra;
}

export const ventaService = new VentaService();

export const getAllVentas = async (): Promise<OrdenCompra[]> => {
  return prisma.ordenCompra.findMany({
    include: {
      empresa: true,
      cliente: {
        select: {
          id: true,
          razonSocial: true,
          ruc: true,
          codigoUnidadEjecutora: true,
          promedioCobranza: true,
        }
      },
      contactoCliente: true,
      catalogoEmpresa: true,
      ordenesProveedor: {
        select: {
          id: true,
          totalProveedor: true,
        },
      },
      facturaciones: {
        select: {
          id: true,
          factura: true,
          fechaFactura: true,
          grr: true,
          esRefacturacion: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
  });
};

export const getVentaById = (id: number): Promise<OrdenCompra | null> => {
  return prisma.ordenCompra.findUnique({
    where: { id },
    include: {
      empresa: true,
      cliente: {
        select: {
          id: true,
          razonSocial: true,
          ruc: true,
          codigoUnidadEjecutora: true,
          promedioCobranza: true,
        }
      },
      contactoCliente: true,
      catalogoEmpresa: true,
      ordenesProveedor: true,
      ordenCompraPrivada: {
        include: {
          pagos: true,
        }
      },
      facturaciones: true,
      gestionCobranzas: true,
      OrdenCompraAgrupada: true,
    },
  });
};

type CreateVentaType = Prisma.OrdenCompraCreateInput & {
  ventaPrivada: Omit<Prisma.OrdenCompraPrivadaCreateInput, 'id' | 'createdAt' | 'updatedAt'> & {
    pagos: Omit<Prisma.PagoOrdenCompraPrivadaCreateInput, 'id' | 'createdAt' | 'updatedAt' | 'ordenCompraPrivada'>[];
    documentoCotizacion?: string;
    cotizacion?: string;
    notaPago?: string;
    tipoDestino?: string;
    nombreAgencia?: string;
    destinoFinal?: string;
    nombreEntidad?: string;
  };
};

export const createVenta = async (data: CreateVentaType): Promise<OrdenCompra> => {
  try {
    const { ventaPrivada, ...directSaleBody } = data;

    const empresaId = directSaleBody.empresa?.connect?.id;
    if (!empresaId) throw new Error('Se requiere el ID de la empresa');

    const codigoVenta = await ocService.generateUniqueOrdenCompraCode(empresaId);
    logger.info('Código de venta generado:', codigoVenta);

    const ventaBody: Prisma.OrdenCompraCreateInput = {
      // Relaciones
      empresa: directSaleBody.empresa,
      cliente: directSaleBody.cliente,
      contactoCliente: directSaleBody.contactoCliente,
      catalogoEmpresa: directSaleBody.catalogoEmpresa,

      // Datos básicos
      codigoVenta,
      ventaPrivada: !!ventaPrivada,

      // Datos de entrega
      departamentoEntrega: directSaleBody.departamentoEntrega,
      provinciaEntrega: directSaleBody.provinciaEntrega,
      distritoEntrega: directSaleBody.distritoEntrega,
      direccionEntrega: directSaleBody.direccionEntrega,
      referenciaEntrega: directSaleBody.referenciaEntrega,
      fechaEntrega: directSaleBody.fechaEntrega,

      // Datos de formulario y SIAF
      fechaForm: directSaleBody.fechaForm,
      fechaMaxForm: directSaleBody.fechaMaxForm,
      montoVenta: directSaleBody.montoVenta,
      siaf: directSaleBody.siaf,
      etapaSiaf: directSaleBody.etapaSiaf,
      fechaSiaf: directSaleBody.fechaSiaf,

      // Documentos
      documentoOce: directSaleBody.documentoOce,
      documentoOcf: directSaleBody.documentoOcf,

      // Productos y estado
      productos: directSaleBody.productos,
      etapaActual: 'creacion',
      estadoVenta: directSaleBody.estadoVenta || 'PENDIENTE',
      estadoActivo: true,
      fechaEmision: new Date(),
    };

    const createResponse = await ocService.createOrdenCompra(ventaBody);

    if (!ventaPrivada) return createResponse;

    // @ts-expect-error 5. Objeto de venta privada
    const { pagos, ...privateOrderData } = ventaPrivada;
    const privateOrderBody = {
      ordenCompraId: createResponse.id,
      ...privateOrderData,
    };

    // 6. Creación venta privada
    const privateOrderResponse = await prisma.ordenCompraPrivada.create({ data: privateOrderBody });

    // 7. Generar array para el create many
    const formatBodyPayments = pagos.map((pago) => ({
      ...pago,
      ordenCompraPrivada: { connect: { id: privateOrderResponse.id } },
    }));
    // @ts-expect-error 8. Crear todos los pagos a la vez
    prisma.pagoOrdenCompraPrivada.createMany({ data: formatBodyPayments });

    return createResponse;
  } catch (error) {
    logger.error('Error en createVenta:', error);
    if (error instanceof Error) {
      throw new Error(`Error al crear la venta: ${error.message}`);
    }
    throw new Error('Error desconocido al crear la venta');
  }
};

type UpdateVentaType = Prisma.OrdenCompraUpdateInput & {
  ventaPrivada?: {
    estadoPago?: any;
    fechaPago?: string | Date;
    documentoPago?: string;
    documentoCotizacion?: string; // Documento de cotización
    cotizacion?: string; // Campo de cotización
    notaPago?: string; // Campo que ya existía pero ahora se maneja correctamente
    // Campos de tipo de entrega
    tipoDestino?: string;
    nombreAgencia?: string;
    destinoFinal?: string;
    nombreEntidad?: string;
    pagos?: Array<{
      fechaPago: string | Date;
      bancoPago: string;
      descripcionPago: string;
      archivoPago?: string;
      montoPago: number;
      estadoPago: boolean;
    }>;
  };
};

export const updateVenta = async (id: number, data: UpdateVentaType): Promise<OrdenCompra> => {
  try {
    const { ventaPrivada, ...ventaData } = data;

    const updatedVenta = await ocService.updateOrdenCompra(id, ventaData);

    if (ventaPrivada) {
      const pagos = ventaPrivada.pagos;
      const privateOrderData = {
        estadoPago: ventaPrivada.estadoPago,
        fechaPago: ventaPrivada.fechaPago,
        documentoPago: ventaPrivada.documentoPago,
        documentoCotizacion: ventaPrivada.documentoCotizacion,
        cotizacion: ventaPrivada.cotizacion,
        notaPago: ventaPrivada.notaPago,
        tipoDestino: ventaPrivada.tipoDestino,
        nombreAgencia: ventaPrivada.nombreAgencia,
        destinoFinal: ventaPrivada.destinoFinal,
        nombreEntidad: ventaPrivada.nombreEntidad,
      };

      // Verificar si ya existe una orden privada
      const existingPrivateOrder = await prisma.ordenCompraPrivada.findUnique({
        where: { ordenCompraId: id },
        include: { pagos: true }
      });

      if (existingPrivateOrder) {
        // Actualizar orden privada existente
        await prisma.ordenCompraPrivada.update({
          where: { id: existingPrivateOrder.id },
          data: {
            estadoPago: privateOrderData.estadoPago,
            fechaPago: privateOrderData.fechaPago,
            documentoPago: privateOrderData.documentoPago,
            documentoCotizacion: privateOrderData.documentoCotizacion,
            cotizacion: privateOrderData.cotizacion,
            notaPago: privateOrderData.notaPago,
            tipoDestino: privateOrderData.tipoDestino as "ENTREGA_DOMICILIO" | "ENTREGA_AGENCIA" | "RECOJO_ALMACEN" | null,
            nombreAgencia: privateOrderData.nombreAgencia,
            destinoFinal: privateOrderData.destinoFinal,
            nombreEntidad: privateOrderData.nombreEntidad,
          }
        });

        // Eliminar pagos existentes y crear nuevos si se proporcionan
        if (pagos && Array.isArray(pagos) && pagos.length > 0) {
          await prisma.pagoOrdenCompraPrivada.deleteMany({
            where: { ordenCompraPrivadaId: existingPrivateOrder.id }
          });

          for (const pago of pagos) {
            await prisma.pagoOrdenCompraPrivada.create({
              data: {
                fechaPago: pago.fechaPago,
                bancoPago: pago.bancoPago,
                descripcionPago: pago.descripcionPago,
                archivoPago: pago.archivoPago,
                montoPago: pago.montoPago,
                estadoPago: pago.estadoPago,
                ordenCompraPrivadaId: existingPrivateOrder.id,
              },
            });
          }
        }
      } else {
        // Crear nueva orden privada si no existe pero la venta es privada
        const privateOrderBody = {
          ordenCompraId: id,
          estadoPago: privateOrderData.estadoPago,
          fechaPago: privateOrderData.fechaPago,
          documentoPago: privateOrderData.documentoPago,
          documentoCotizacion: privateOrderData.documentoCotizacion, // Documento de cotización
          cotizacion: privateOrderData.cotizacion, // Campo de cotización
          notaPago: privateOrderData.notaPago, // Campo que faltaba
        };

        const newPrivateOrder = await prisma.ordenCompraPrivada.create({
          data: privateOrderBody
        });

        // Crear pagos si se proporcionan
        if (pagos && Array.isArray(pagos) && pagos.length > 0) {
          for (const pago of pagos) {
            await prisma.pagoOrdenCompraPrivada.create({
              data: {
                fechaPago: pago.fechaPago,
                bancoPago: pago.bancoPago,
                descripcionPago: pago.descripcionPago,
                archivoPago: pago.archivoPago,
                montoPago: pago.montoPago,
                estadoPago: pago.estadoPago,
                ordenCompraPrivadaId: newPrivateOrder.id,
              },
            });
          }
        }
      }
    }

    return updatedVenta;
  } catch (error) {
    logger.error('Error en updateVenta:', error);
    if (error instanceof Error) {
      throw new Error(`Error al actualizar la venta: ${error.message}`);
    }
    throw new Error('Error desconocido al actualizar la venta');
  }
};

export const patchVenta = async (id: number, data: Partial<UpdateVentaType>): Promise<OrdenCompra> => {
  try {
    const { ventaPrivada, ...ventaData } = data;

    // Convertir fechas string a objetos Date para Prisma
    const processedData: Partial<Prisma.OrdenCompraUpdateInput> = { ...ventaData };

    if (ventaData.fechaEntregaOc && typeof ventaData.fechaEntregaOc === 'string') {
      processedData.fechaEntregaOc = new Date(ventaData.fechaEntregaOc);
    }

    if (ventaData.fechaPeruCompras && typeof ventaData.fechaPeruCompras === 'string') {
      processedData.fechaPeruCompras = new Date(ventaData.fechaPeruCompras);
    }

    if (ventaData.documentoPeruCompras) {
      processedData.documentoPeruCompras = ventaData.documentoPeruCompras;
    }

    // Actualizar orden de compra principal usando el servicio de OC
    const updatedVenta = await ocService.patchOrdenCompra(id, processedData);

    // Si hay datos de venta privada, manejarlos
    if (ventaPrivada) {
      // Aquí puedes agregar lógica específica para venta privada si es necesario
      logger.info('Datos de venta privada recibidos en PATCH:', ventaPrivada);
    }

    return updatedVenta;
  } catch (error) {
    logger.error('Error en patchVenta:', error);
    if (error instanceof Error) {
      throw new Error(`Error al actualizar parcialmente la venta: ${error.message}`);
    }
    throw new Error('Error desconocido al actualizar parcialmente la venta');
  }
};

export const deleteVenta = (id: number): Promise<OrdenCompra> => {
  return ocService.updateOrdenCompra(id, { estadoActivo: false });
};

export const createOrdenCompraPrivada = async (
  data: Omit<Prisma.OrdenCompraPrivadaCreateInput, 'id' | 'createdAt' | 'updatedAt'> & {
    pagos?: Omit<Prisma.PagoOrdenCompraPrivadaCreateInput, 'id' | 'createdAt' | 'updatedAt' | 'ordenCompraPrivada'>[];
  }
): Promise<OrdenCompraPrivada> => {
  const { pagos, ...ordenData } = data;
  const orden = await prisma.ordenCompraPrivada.create({ data: ordenData });
  if (pagos && Array.isArray(pagos) && pagos.length > 0) {
    for (const pago of pagos) {
      await prisma.pagoOrdenCompraPrivada.create({
        data: {
          ...pago,
          ordenCompraPrivada: { connect: { id: orden.id } },
        },
      });
    }
  }
  return orden;
};

export const calcularPromedioCobranzaCliente = async (clienteId: number): Promise<number | null> => {
  try {
    // Obtener todas las órdenes de compra del cliente
    const ordenesCompra = await prisma.ordenCompra.findMany({
      where: {
        clienteId: clienteId,
        estadoActivo: true,
      },
      include: {
        gestionCobranzas: true,
        facturaciones: true,
      },
    });

    if (ordenesCompra.length === 0) {
      return null;
    }

    let totalDiasCobranza = 0;
    let ordenesConCobranzaCompleta = 0;

    for (const orden of ordenesCompra) {
      // Verificar si la orden tiene netoCobrado (indica que la cobranza está completa)
      if (orden.netoCobrado && Number(orden.netoCobrado) > 0) {
        // Buscar la fecha de la última gestión de cobranza
        const gestionesOrdenadas = orden.gestionCobranzas.sort((a, b) =>
          new Date(b.fechaGestion).getTime() - new Date(a.fechaGestion).getTime()
        );

        if (gestionesOrdenadas.length > 0) {
          const fechaUltimaGestion = gestionesOrdenadas[0].fechaGestion;

          // Calcular días desde la fecha de entrega OC hasta la fecha de última gestión
          const fechaEntrega = orden.fechaEntregaOc || orden.fechaEntrega;
          if (fechaEntrega) {
            const diasCobranza = Math.ceil(
              (new Date(fechaUltimaGestion).getTime() - new Date(fechaEntrega).getTime()) / (1000 * 60 * 60 * 24)
            );
            // Solo contar si los días son positivos y razonables (máximo 365 días)
            if (diasCobranza > 0 && diasCobranza <= 365) {
              totalDiasCobranza += diasCobranza;
              ordenesConCobranzaCompleta++;
            }
          }
        }
      }
    }

    if (ordenesConCobranzaCompleta === 0) {
      return null;
    }

    // Calcular promedio en días
    const promedioDias = totalDiasCobranza / ordenesConCobranzaCompleta;

    // Actualizar el promedio en la tabla cliente
    await prisma.cliente.update({
      where: { id: clienteId },
      data: { promedioCobranza: promedioDias },
    });

    return promedioDias;
  } catch (error) {
    logger.error('Error calculando promedio de cobranza:', error);
    return null;
  }
};

export const updatePromedioCobranzaCliente = async (clienteId: number, promedioCobranza: number): Promise<void> => {
  try {
    await prisma.cliente.update({
      where: { id: clienteId },
      data: { promedioCobranza },
    });
  } catch (error) {
    logger.error('Error actualizando promedio de cobranza:', error);
    throw error;
  }
};
