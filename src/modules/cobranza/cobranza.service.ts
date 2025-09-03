import prisma from '../../database/prisma';
import { Prisma, EstadoCobranza } from '@prisma/client';

// Tipos específicos para cobranza
interface CobranzaFields {
  etapaSiaf?: string;
  fechaSiaf?: string | Date;
  penalidad?: string | number;
  estadoCobranza?: EstadoCobranza;
  fechaEstadoCobranza?: string | Date;
}

/**
 * Procesa los datos de cobranza antes de guardar
 */
const processCobranzaFields = (data: CobranzaFields) => {
  const processedData: any = { ...data };

  // Procesar penalidad como Decimal
  if (processedData.penalidad !== undefined) {
    if (processedData.penalidad === '' || processedData.penalidad === null) {
      processedData.penalidad = null;
    } else if (typeof processedData.penalidad === 'string') {
      processedData.penalidad = new Prisma.Decimal(processedData.penalidad);
    } else {
      processedData.penalidad = new Prisma.Decimal(Number(processedData.penalidad));
    }
  }

  // Procesar fechaSiaf
  if (processedData.fechaSiaf) {
    if (typeof processedData.fechaSiaf === 'string' && processedData.fechaSiaf.trim() !== '') {
      processedData.fechaSiaf = new Date(processedData.fechaSiaf);
    } else if (processedData.fechaSiaf === '' || processedData.fechaSiaf === null) {
      processedData.fechaSiaf = null;
    }
  }

  // Procesar fechaEstadoCobranza
  if (processedData.fechaEstadoCobranza) {
    if (typeof processedData.fechaEstadoCobranza === 'string' && processedData.fechaEstadoCobranza.trim() !== '') {
      processedData.fechaEstadoCobranza = new Date(processedData.fechaEstadoCobranza);
    } else if (processedData.fechaEstadoCobranza === '' || processedData.fechaEstadoCobranza === null) {
      processedData.fechaEstadoCobranza = null;
    }
  }

  return processedData;
};

/**
 * Actualiza los campos específicos de cobranza en una orden de compra
 * Solo actualiza los campos que se envían en el objeto data
 */
export const updateCobranzaFields = async (ordenCompraId: number, data: CobranzaFields) => {
  // Filtrar campos undefined/null para el PATCH
  const processedData = processCobranzaFields(data);

  // Construir objeto de actualización solo con campos definidos
  const updateData: any = {};

  if (processedData.etapaSiaf !== undefined) {
    updateData.etapaSiaf = processedData.etapaSiaf;
  }

  if (processedData.fechaSiaf !== undefined) {
    updateData.fechaSiaf = processedData.fechaSiaf;
  }

  if (processedData.penalidad !== undefined) {
    updateData.penalidad = processedData.penalidad;
  }

  if (processedData.estadoCobranza !== undefined) {
    updateData.estadoCobranza = processedData.estadoCobranza;
  }

  if (processedData.fechaEstadoCobranza !== undefined) {
    updateData.fechaEstadoCobranza = processedData.fechaEstadoCobranza;
  }

  // Si no hay campos para actualizar, retornar la orden actual
  if (Object.keys(updateData).length === 0) {
    return await getCobranzaByOrdenCompra(ordenCompraId);
  }

  console.log(`[PATCH] Actualizando orden ${ordenCompraId} con campos:`, Object.keys(updateData));

  return await prisma.ordenCompra.update({
    where: { id: ordenCompraId },
    data: updateData,
    select: {
      id: true,
      codigoVenta: true,
      etapaSiaf: true,
      fechaSiaf: true,
      penalidad: true,
      estadoCobranza: true,
      fechaEstadoCobranza: true,
      montoVenta: true,
      netoCobrado: true,
      updatedAt: true,
      cliente: {
        select: {
          id: true,
          razonSocial: true,
          ruc: true
        }
      },
      empresa: {
        select: {
          id: true,
          razonSocial: true,
          ruc: true
        }
      }
    }
  });
};

/**
 * Obtiene la información de cobranza de una orden de compra
 */
export const getCobranzaByOrdenCompra = async (ordenCompraId: number) => {
  return await prisma.ordenCompra.findUnique({
    where: { id: ordenCompraId },
    select: {
      id: true,
      codigoVenta: true,
      etapaSiaf: true,
      fechaSiaf: true,
      penalidad: true,
      estadoCobranza: true,
      fechaEstadoCobranza: true,
      montoVenta: true,
      netoCobrado: true,
      cliente: {
        select: {
          id: true,
          razonSocial: true,
          ruc: true
        }
      },
      empresa: {
        select: {
          id: true,
          razonSocial: true,
          ruc: true
        }
      }
    }
  });
};
