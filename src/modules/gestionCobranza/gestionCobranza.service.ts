import { GestionCobranza, Prisma } from '@prisma/client';
import prisma from '../../database/prisma';

type CreateGestionCobranzaData = Omit<GestionCobranza, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateGestionCobranzaData = Partial<CreateGestionCobranzaData>;

/**
 * Procesa los datos de gestión antes de guardar (fechas y validaciones)
 */
const processGestionData = (data: CreateGestionCobranzaData | UpdateGestionCobranzaData) => {
  const processedData: any = { ...data };
  
  // Procesar fechaGestion
  if (processedData.fechaGestion) {
    if (typeof processedData.fechaGestion === 'string' && processedData.fechaGestion.trim() !== '') {
      processedData.fechaGestion = new Date(processedData.fechaGestion);
    } else if (processedData.fechaGestion === '' || processedData.fechaGestion === null) {
      processedData.fechaGestion = null;
    }
  }

  return processedData;
};

/**
 * Obtiene todas las gestiones de cobranza
 */
export const getAllGestionCobranza = (): Promise<GestionCobranza[]> => {
  return prisma.gestionCobranza.findMany({
    include: {
      ordenCompra: {
        select: {
          id: true,
          codigoVenta: true,
          cliente: {
            select: {
              razonSocial: true,
              ruc: true
            }
          }
        }
      }
    },
    orderBy: {
      fechaGestion: 'desc'
    }
  });
};

/**
 * Obtiene las gestiones de cobranza por orden de compra
 */
export const getGestionCobranzaByOrdenCompra = (ordenCompraId: number): Promise<GestionCobranza[]> => {
  return prisma.gestionCobranza.findMany({
    where: { ordenCompraId },
    include: {
      usuario: {
        select: {
          id: true,
          nombre: true,
          email: true
        }
      },
      ordenCompra: {
        select: {
          id: true,
          codigoVenta: true
        }
      }
    },
    orderBy: { fechaGestion: 'desc' }
  });
};

/**
 * Obtiene una gestión de cobranza por ID
 */
export const getGestionCobranzaById = (id: number): Promise<GestionCobranza | null> => {
  return prisma.gestionCobranza.findUnique({ 
    where: { id },
    include: {
      ordenCompra: {
        select: {
          id: true,
          codigoVenta: true,
          cliente: {
            select: {
              razonSocial: true,
              ruc: true
            }
          }
        }
      }
    }
  });
};

/**
 * Crea una nueva gestión de cobranza
 */
export const createGestionCobranza = (data: CreateGestionCobranzaData): Promise<GestionCobranza> => {
  const processedData = processGestionData(data);
  return prisma.gestionCobranza.create({ 
    data: processedData,
    include: {
      ordenCompra: {
        select: {
          id: true,
          codigoVenta: true,
          cliente: {
            select: {
              razonSocial: true,
              ruc: true
            }
          }
        }
      }
    }
  });
};

/**
 * Actualiza una gestión de cobranza
 */
export const updateGestionCobranza = (id: number, data: UpdateGestionCobranzaData): Promise<GestionCobranza> => {
  const processedData = processGestionData(data);
  return prisma.gestionCobranza.update({ 
    where: { id }, 
    data: processedData,
    include: {
      ordenCompra: {
        select: {
          id: true,
          codigoVenta: true,
          cliente: {
            select: {
              razonSocial: true,
              ruc: true
            }
          }
        }
      }
    }
  });
};

/**
 * Elimina una gestión de cobranza
 */
export const deleteGestionCobranza = (id: number): Promise<GestionCobranza> => {
  return prisma.gestionCobranza.delete({ where: { id } });
};
