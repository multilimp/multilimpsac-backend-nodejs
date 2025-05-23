import prisma from '../../database/prisma';
import { Facturacion, OrdenCompra, Prisma } from '@prisma/client';

// Tipos de Datos Manuales
export type CreateFacturacionData = Omit<Facturacion, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateFacturacionData = Partial<Omit<Facturacion, 'id' | 'createdAt' | 'updatedAt'>>;

// Función auxiliar para procesar datos (fechas, Decimal)
const processFacturacionData = (data: any): Partial<Facturacion> => {
  const processedData: Partial<Facturacion> = { ...data };

  if (data.fechaFactura && typeof data.fechaFactura === 'string') {
    processedData.fechaFactura = new Date(data.fechaFactura);
  }

  if (data.retencion && typeof data.retencion !== 'object') {
    processedData.retencion = new Prisma.Decimal(data.retencion);
  } else if (data.retencion === null || data.retencion === undefined) {
    processedData.retencion = null;
  }


  if (data.detraccion && typeof data.detraccion !== 'object') {
    processedData.detraccion = new Prisma.Decimal(data.detraccion);
  } else if (data.detraccion === null || data.detraccion === undefined) {
    processedData.detraccion = null;
  }
  
  if (data.estado === undefined && data.id === undefined) { // Solo default para creación
    processedData.estado = 1;
  }

  return processedData;
};

export const facturacionService = {
  async createOrUpdateFacturacion(data: CreateFacturacionData | UpdateFacturacionData) {
    const { ordenCompraId } = data;

    if (ordenCompraId === undefined || ordenCompraId === null) {
      throw new Error('El ID de la orden de compra es requerido.');
    }

    const ordenCompraExists = await prisma.ordenCompra.findUnique({
      where: { id: ordenCompraId },
    });

    if (!ordenCompraExists) {
      throw new Error(`La orden de compra con ID ${ordenCompraId} no existe.`);
    }

    const processedInputData = processFacturacionData(data);

    const existingFacturacion = await prisma.facturacion.findFirst({
      where: { ordenCompraId },
      orderBy: { createdAt: 'desc' },
    });

    if (existingFacturacion) {
      // Actualizar
      const { id: _id, ordenCompraId: _ocId, createdAt: _ca, updatedAt: _ua, ...updateData } = processedInputData;
      return prisma.facturacion.update({
        where: { id: existingFacturacion.id },
        data: updateData,
      });
    } else {
      // Crear
      if (!processedInputData.ordenCompraId) { // Asegurar que ordenCompraId esté para la creación
        throw new Error('El ID de la orden de compra es requerido para crear la facturación.');
      }
      return prisma.facturacion.create({
        data: processedInputData as CreateFacturacionData,
      });
    }
  },

  async getFacturacionById(id: number) {
    if (isNaN(id)) {
      throw new Error('El ID de la facturación debe ser un número.');
    }
    return prisma.facturacion.findUnique({
      where: { id },
      include: {
        ordenCompra: {
          select: {
            id: true,
            codigoVenta: true,
            cliente: {
              select: {
                id: true,
                razonSocial: true,
                ruc: true,
              },
            },
            empresa: {
              select: {
                id: true,
                razonSocial: true,
                ruc: true,
              },
            },
          },
        },
      },
    });
  },

  async getFacturacionByOrdenCompraId(ordenCompraId: number) {
    if (isNaN(ordenCompraId)) {
      throw new Error('El ID de la orden de compra debe ser un número.');
    }
    return prisma.facturacion.findFirst({
      where: { ordenCompraId },
      orderBy: { createdAt: 'desc' },
      include: {
        ordenCompra: {
          select: {
            id: true,
            codigoVenta: true,
          },
        },
      },
    });
  },
};
