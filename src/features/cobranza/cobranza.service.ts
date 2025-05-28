import prisma from '../../database/prisma';
import { GestionCobranza, Prisma } from '@prisma/client';

// Tipos de Datos
type CreateGestionData = Omit<GestionCobranza, 'id' | 'createdAt' | 'updatedAt' | 'ordenCompraId'>; // ordenCompraId will be provided
type UpdateGestionData = Partial<Omit<GestionCobranza, 'id' | 'createdAt' | 'updatedAt' | 'ordenCompraId'>>;

// Tipo para la actualización de cobranza
type CobranzaData = {
  penalidad?: string | number | null;
  netoCobrado?: string | number | null;
  estadoCobranza?: string | null;
  fechaEstadoCobranza?: string | Date | null;
  fechaProximaGestion?: string | Date | null;
  gestiones?: (CreateGestionData | (UpdateGestionData & { id: number }))[];
};

// Función auxiliar para procesar datos (fechas, Decimal)
const processCobranzaData = (data: CobranzaData) => {
  const processedData: any = { ...data };

  if (processedData.penalidad !== undefined) {
    if (processedData.penalidad === '' || processedData.penalidad === null) {
      processedData.penalidad = null;
    } else if (typeof processedData.penalidad === 'string') {
      processedData.penalidad = new Prisma.Decimal(processedData.penalidad);
    } else {
        processedData.penalidad = new Prisma.Decimal(Number(processedData.penalidad));
    }
  }

  if (processedData.netoCobrado !== undefined) {
    if (processedData.netoCobrado === '' || processedData.netoCobrado === null) {
      processedData.netoCobrado = null;
    } else if (typeof processedData.netoCobrado === 'string') {
      processedData.netoCobrado = new Prisma.Decimal(processedData.netoCobrado);
    } else {
        processedData.netoCobrado = new Prisma.Decimal(Number(processedData.netoCobrado));
    }
  }

  if (processedData.fechaEstadoCobranza) {
    if (typeof processedData.fechaEstadoCobranza === 'string' && processedData.fechaEstadoCobranza.trim() !== '') {
      processedData.fechaEstadoCobranza = new Date(processedData.fechaEstadoCobranza);
    } else if (processedData.fechaEstadoCobranza === '' || processedData.fechaEstadoCobranza === null) {
      processedData.fechaEstadoCobranza = null;
    }
  } else {
    processedData.fechaEstadoCobranza = null;
  }


  if (processedData.fechaProximaGestion) {
    if (typeof processedData.fechaProximaGestion === 'string' && processedData.fechaProximaGestion.trim() !== '') {
      processedData.fechaProximaGestion = new Date(processedData.fechaProximaGestion);
    } else if (processedData.fechaProximaGestion === '' || processedData.fechaProximaGestion === null){
      processedData.fechaProximaGestion = null;
    }
  } else {
      processedData.fechaProximaGestion = null;
  }

  return processedData;
};

// Función auxiliar para procesar datos de gestión
const processGestionData = (gestion: CreateGestionData | (UpdateGestionData & { id: number })) => {
  const processedGestion: any = { ...gestion };
  
  if (processedGestion.fechaGestion) {
    if (typeof processedGestion.fechaGestion === 'string' && processedGestion.fechaGestion.trim() !== '') {
      processedGestion.fechaGestion = new Date(processedGestion.fechaGestion);
    } else if (processedGestion.fechaGestion === '' || processedGestion.fechaGestion === null) {
        processedGestion.fechaGestion = null;
    }
  } else {
      processedGestion.fechaGestion = null;
  }
  if (processedGestion.estadoCobranza === undefined && !('id' in gestion && gestion.id)) {
    processedGestion.estadoCobranza = "PENDIENTE"; 
  }
  
  const dataToUpsert: Partial<GestionCobranza> = {};
  
  if (processedGestion.notaGestion !== undefined) dataToUpsert.notaGestion = processedGestion.notaGestion;
  if (processedGestion.estadoCobranza !== undefined) dataToUpsert.estadoCobranza = processedGestion.estadoCobranza;
  if (processedGestion.fechaGestion !== undefined) dataToUpsert.fechaGestion = processedGestion.fechaGestion;
  if (processedGestion.tipoCobranza !== undefined) dataToUpsert.tipoCobranza = processedGestion.tipoCobranza;
  if (processedGestion.voucherPagoUrl !== undefined) dataToUpsert.voucherPagoUrl = processedGestion.voucherPagoUrl;
  if (processedGestion.pagoConformeTesoreria !== undefined) dataToUpsert.pagoConformeTesoreria = processedGestion.pagoConformeTesoreria;
  if (processedGestion.cartaAmpliacionUrl !== undefined) dataToUpsert.cartaAmpliacionUrl = processedGestion.cartaAmpliacionUrl;
  if (processedGestion.capturaEnvioDocumentoUrl !== undefined) dataToUpsert.capturaEnvioDocumentoUrl = processedGestion.capturaEnvioDocumentoUrl;
  if (processedGestion.archivosAdjuntosNotasGestion !== undefined) dataToUpsert.archivosAdjuntosNotasGestion = processedGestion.archivosAdjuntosNotasGestion;
  if (processedGestion.documentosRegistrados !== undefined) dataToUpsert.documentosRegistrados = processedGestion.documentosRegistrados;
  if (processedGestion.notaEspecialEntrega !== undefined) dataToUpsert.notaEspecialEntrega = processedGestion.notaEspecialEntrega;
  if (processedGestion.usuarioId !== undefined) dataToUpsert.usuarioId = processedGestion.usuarioId;

  return dataToUpsert;
};

export const cobranzaService = {
  async updateCobranza(ordenCompraId: number, data: CobranzaData) {
    const { gestiones, ...cobranzaData } = data;
    
    const processedCobranzaData = processCobranzaData(cobranzaData);

    return await prisma.$transaction(async (tx) => {
      await tx.ordenCompra.update({
        where: { id: ordenCompraId },
        data: {
          penalidad: processedCobranzaData.penalidad,
          netoCobrado: processedCobranzaData.netoCobrado,
          estadoCobranza: processedCobranzaData.estadoCobranza,
          fechaEstadoCobranza: processedCobranzaData.fechaEstadoCobranza,
          fechaProximaGestion: processedCobranzaData.fechaProximaGestion
        }
      });

      if (gestiones && gestiones.length > 0) {
        for (const gestion of gestiones) {
          const processedGestionData = processGestionData(gestion);
          
          if ('id' in gestion && gestion.id) {
            await tx.gestionCobranza.update({
              where: { id: gestion.id },
              data: processedGestionData 
            });
          } else {
            await tx.gestionCobranza.create({
              data: {
                ...(processedGestionData as CreateGestionData),
                ordenCompraId
              }
            });
          }
        }
      }

      return tx.ordenCompra.findUnique({
          where: { id: ordenCompraId },
          include: {
              gestionCobranzas: {
                  orderBy: { fechaGestion: 'desc' }
              }
          }
      });
    });
  },

  async getGestionesByOrdenCompraId(ordenCompraId: number) {
    return prisma.gestionCobranza.findMany({
      where: { ordenCompraId },
      orderBy: { fechaGestion: 'desc' }
    });
  }
};
