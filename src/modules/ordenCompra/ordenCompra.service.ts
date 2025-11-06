import { OrdenCompra, Prisma } from '@prisma/client';
import prisma from '../../database/prisma';
import { parseDatePreserveDay } from '../../shared/utils/dateHelpers';

export const getAllOrdenesCompra = (args?: Prisma.OrdenCompraFindManyArgs): Promise<OrdenCompra[]> => {
  // Si no se especifica orderBy, usar ordenamiento descendente por fecha de creación
  const defaultArgs: Prisma.OrdenCompraFindManyArgs = {
    orderBy: { createdAt: 'desc' },
    ...args
  };

  return prisma.ordenCompra.findMany(defaultArgs);
};

export const getOrdenCompraById = (id: number, includeOptions?: Prisma.OrdenCompraInclude): Promise<OrdenCompra | null> => {
  return prisma.ordenCompra.findUnique({
    where: { id },
    include: includeOptions,
  });
};

export const createOrdenCompra = (data: Prisma.OrdenCompraCreateInput): Promise<OrdenCompra> => {
  return prisma.ordenCompra.create({ data });
};

export const updateOrdenCompra = (id: number, data: Prisma.OrdenCompraUpdateInput): Promise<OrdenCompra> => {
  return prisma.ordenCompra.update({
    where: { id },
    data,
  });
};

export const patchOrdenCompra = (id: number, data: Partial<Prisma.OrdenCompraUpdateInput>): Promise<OrdenCompra> => {
  const processedData: Prisma.OrdenCompraUpdateInput = { ...data };

  if (data.fechaEmision && typeof data.fechaEmision === 'string') {
    processedData.fechaEmision = new Date(data.fechaEmision);
  }

  if (typeof data.fechaEntregaOc !== 'undefined') {
    const d = parseDatePreserveDay(data.fechaEntregaOc as string | Date);
    if (d) processedData.fechaEntregaOc = d;
  }
  if (typeof data.fechaPeruCompras !== 'undefined') {
    const d = parseDatePreserveDay(data.fechaPeruCompras as string | Date);
    if (d) processedData.fechaPeruCompras = d;
  }
  if (typeof data.fechaForm !== 'undefined') {
    const d = parseDatePreserveDay(data.fechaForm as string | Date);
    if (d) processedData.fechaForm = d;
  }
  if (typeof data.fechaMaxForm !== 'undefined') {
    const d = parseDatePreserveDay(data.fechaMaxForm as string | Date);
    if (d) processedData.fechaMaxForm = d;
  }
  if (typeof data.fechaSiaf !== 'undefined') {
    const d = parseDatePreserveDay(data.fechaSiaf as string | Date);
    if (d) processedData.fechaSiaf = d;
  }
  if (typeof data.fechaEstadoCobranza !== 'undefined') {
    const d = parseDatePreserveDay(data.fechaEstadoCobranza as string | Date);
    if (d) processedData.fechaEstadoCobranza = d;
  }
  if (typeof data.fechaEntrega !== 'undefined') {
    const d = parseDatePreserveDay(data.fechaEntrega as string | Date);
    if (d) processedData.fechaEntrega = d;
  }
  if (typeof data.fechaProximaGestion !== 'undefined') {
    const d = parseDatePreserveDay(data.fechaProximaGestion as string | Date);
    if (d) processedData.fechaProximaGestion = d;
  }

  return prisma.ordenCompra.update({
    where: { id },
    data: processedData,
  });
};

export const deleteOrdenCompra = (id: number): Promise<OrdenCompra> => {
  return prisma.ordenCompra.update({
    where: { id },
    data: { estadoActivo: false }
  });
};

export const generateUniqueOrdenCompraCode = async (empresaId: number): Promise<string> => {
  try {
    // Obtener la empresa para extraer las 3 primeras letras
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      select: { razonSocial: true }
    });

    if (!empresa) {
      throw new Error('Empresa no encontrada');
    }

    // Extraer las 3 primeras letras de la razón social (sin espacios ni caracteres especiales)
    let tresLetras = empresa.razonSocial
      .replace(/[^a-zA-Z]/g, '') // Solo letras
      .substring(0, 3)
      .toUpperCase();

    // Si no hay suficientes letras, usar las disponibles o un fallback
    if (tresLetras.length < 3) {
      if (tresLetras.length === 0) {
        tresLetras = 'EMP'; // Fallback si no hay letras
      } else {
        // Completar con X si faltan letras
        tresLetras = tresLetras.padEnd(3, 'X');
      }
    }

    // Obtener el siguiente número secuencial usando count agrupado por empresa
    const ordenesCount = await prisma.ordenCompra.count({
      where: {
        empresa: {
          id: empresaId
        }
      }
    });

    // El siguiente número es el count + 1
    const siguienteNumero = ordenesCount + 1;

    // Formato: OC + 3 letras + número secuencial
    return `OC${tresLetras}${siguienteNumero}`;
  } catch (error) {
    console.error('Error generando código de orden de compra:', error);
    // Fallback: usar timestamp si hay error
    return `OC${Date.now()}`;
  }
};
