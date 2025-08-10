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
      cliente: true,
      contactoCliente: true,
      catalogoEmpresa: true,
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
      cliente: true,
      contactoCliente: true,
      catalogoEmpresa: true,
      ordenesProveedor: true,
      ordenCompraPrivada: {
        include: {
          cliente: true,
          contactoCliente: true,
          pagos: true,
        }
      },
      facturacion: true,
      gestionCobranzas: true,
      OrdenCompraAgrupada: true,
    },  
  });
};

type CreateVentaType = Prisma.OrdenCompraCreateInput & {
  ventaPrivada: Omit<Prisma.OrdenCompraPrivadaCreateInput, 'id' | 'createdAt' | 'updatedAt'> & {
    pagos: Omit<Prisma.PagoOrdenCompraPrivadaCreateInput, 'id' | 'createdAt' | 'updatedAt' | 'ordenCompraPrivada'>[];
  };
};

export const createVenta = async (data: CreateVentaType): Promise<OrdenCompra> => {
  try {
    const { ventaPrivada, ...directSaleBody } = data;

    // 1. Validar que exista empresa
    const empresaId = directSaleBody.empresa?.connect?.id;
    if (!empresaId) throw new Error('Se requiere el ID de la empresa');

    // 2. Generar código único de venta
    const codigoVenta = await ocService.generateUniqueOrdenCompraCode(empresaId);
    logger.info('Código de venta generado:', codigoVenta);

    // 3. Preparar los datos para la creación
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
      fechaEntrega: directSaleBody.fechaEntrega ? new Date(directSaleBody.fechaEntrega) : null,

      // Datos de formulario y SIAF
      fechaForm: new Date(directSaleBody.fechaForm!),
      fechaMaxForm: new Date(directSaleBody.fechaMaxForm!),
      montoVenta: directSaleBody.montoVenta,
      siaf: directSaleBody.siaf,
      etapaSiaf: directSaleBody.etapaSiaf,
      fechaSiaf: directSaleBody.fechaSiaf ? new Date(directSaleBody.fechaSiaf) : null,

      // Documentos
      documentoOce: directSaleBody.documentoOce,
      documentoOcf: directSaleBody.documentoOcf,

      // Productos y estado
      productos: directSaleBody.productos,
      etapaActual: 'creacion',
      estadoVenta: directSaleBody.estadoVenta || 'incompleto',
      estadoActivo: true,
      fechaEmision: new Date(),
    };

    logger.info('Datos finales para crear venta:', ventaBody);

    // 4. Crear la venta
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
    clienteId?: number;
    contactoClienteId?: number;
    estadoPago?: any;
    fechaPago?: string | Date;
    documentoPago?: string;
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

    // 1. Actualizar orden de compra principal
    const updatedVenta = await ocService.updateOrdenCompra(id, ventaData);

    // 2. Si existe información de venta privada, manejar esa relación
    if (ventaPrivada) {
      const pagos = ventaPrivada.pagos;
      const privateOrderData = {
        clienteId: ventaPrivada.clienteId,
        contactoClienteId: ventaPrivada.contactoClienteId,
        estadoPago: ventaPrivada.estadoPago,
        fechaPago: ventaPrivada.fechaPago,
        documentoPago: ventaPrivada.documentoPago,
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
            clienteId: privateOrderData.clienteId,
            contactoClienteId: privateOrderData.contactoClienteId,
            estadoPago: privateOrderData.estadoPago,
            fechaPago: privateOrderData.fechaPago ? new Date(privateOrderData.fechaPago) : null,
            documentoPago: privateOrderData.documentoPago,
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
                fechaPago: new Date(pago.fechaPago),
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
          clienteId: privateOrderData.clienteId,
          contactoClienteId: privateOrderData.contactoClienteId,
          estadoPago: privateOrderData.estadoPago,
          fechaPago: privateOrderData.fechaPago ? new Date(privateOrderData.fechaPago) : null,
          documentoPago: privateOrderData.documentoPago,
        };

        const newPrivateOrder = await prisma.ordenCompraPrivada.create({ 
          data: privateOrderBody 
        });

        // Crear pagos si se proporcionan
        if (pagos && Array.isArray(pagos) && pagos.length > 0) {
          for (const pago of pagos) {
            await prisma.pagoOrdenCompraPrivada.create({
              data: {
                fechaPago: new Date(pago.fechaPago),
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
