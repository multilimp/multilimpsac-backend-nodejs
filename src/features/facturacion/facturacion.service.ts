import prisma from '../../database/prisma';
import { Facturacion, OrdenCompra, Prisma } from '@prisma/client';

// Tipos de Datos Manuales
export type CreateFacturacionData = Omit<Facturacion, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateFacturacionData = Partial<Omit<Facturacion, 'id' | 'createdAt' | 'updatedAt'>>;

// Función auxiliar para procesar datos (fechas, Decimal)
const processFacturacionData = (data: any): Partial<Facturacion> => {
  const processedData: Partial<Facturacion> = { ...data };

  if (data.fechaFactura && typeof data.fechaFactura === 'string') {
    // Detectar si es formato YYYY-MM-DD (solo fecha) y agregar tiempo local
    if (/^\d{4}-\d{2}-\d{2}$/.test(data.fechaFactura)) {
      // Para formato solo fecha, agregar tiempo medio día para evitar problemas de zona horaria
      processedData.fechaFactura = new Date(`${data.fechaFactura}T12:00:00.000Z`);
    } else {
      // Para otros formatos (con tiempo), usar normal
      processedData.fechaFactura = new Date(data.fechaFactura);
    }
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
    console.log('🔍 DEBUG: createOrUpdateFacturacion iniciado');
    console.log('🔍 DEBUG: Datos recibidos:', data);
    
    const { ordenCompraId } = data;

    if (ordenCompraId === undefined || ordenCompraId === null) {
      console.log('❌ DEBUG: ordenCompraId es undefined o null');
      throw new Error('El ID de la orden de compra es requerido.');
    }

    console.log('🔍 DEBUG: Verificando existencia de orden de compra:', ordenCompraId);
    const ordenCompraExists = await prisma.ordenCompra.findUnique({
      where: { id: ordenCompraId },
    });

    if (!ordenCompraExists) {
      console.log('❌ DEBUG: Orden de compra no existe');
      throw new Error(`La orden de compra con ID ${ordenCompraId} no existe.`);
    }

    console.log('✅ DEBUG: Orden de compra existe');
    const processedInputData = processFacturacionData(data);
    console.log('🔍 DEBUG: Datos procesados:', processedInputData);

    const existingFacturacion = await prisma.facturacion.findFirst({
      where: { ordenCompraId },
      orderBy: { createdAt: 'desc' },
    });

    console.log('🔍 DEBUG: Facturación existente:', existingFacturacion);

    if (existingFacturacion) {
      console.log('🔍 DEBUG: Actualizando facturación existente');
      const { id: _id, ordenCompraId: _ocId, createdAt: _ca, updatedAt: _ua, ...updateData } = processedInputData;
      const result = await prisma.facturacion.update({
        where: { id: existingFacturacion.id },
        data: updateData,
      });
      console.log('✅ DEBUG: Facturación actualizada:', result);
      return result;
    } else {
      console.log('🔍 DEBUG: Creando nueva facturación');
      if (!processedInputData.ordenCompraId) {
        console.log('❌ DEBUG: ordenCompraId faltante para creación');
        throw new Error('El ID de la orden de compra es requerido para crear la facturación.');
      }
      const result = await prisma.facturacion.create({
        data: processedInputData as CreateFacturacionData,
      });
      console.log('✅ DEBUG: Facturación creada:', result);
      return result;
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
