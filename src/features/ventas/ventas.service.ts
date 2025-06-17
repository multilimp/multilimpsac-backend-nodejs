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
      ordenCompraPrivada: true,
      facturaciones: true,
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
      fechaSiaf: new Date(directSaleBody.fechaSiaf!),

      // Documentos
      documentoOce: directSaleBody.documentoOce,
      documentoOcf: directSaleBody.documentoOcf,

      // Productos y estado
      productos: JSON.stringify(directSaleBody.productos),
      etapaActual: 'creacion',
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

export const updateVenta = (id: number, data: Prisma.OrdenCompraUpdateInput): Promise<OrdenCompra> => {
  return ocService.updateOrdenCompra(id, data);
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
