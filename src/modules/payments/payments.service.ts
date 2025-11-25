import { PagoOrdenCompraPrivada, PagoOrdenProveedor, PagoTransporteAsignado } from '../../../prisma/generated/client';
import prisma from '../../database/prisma';

export type EntityType = 'ordenCompraPrivada' | 'ordenProveedor' | 'transporteAsignado';

export interface PaymentData {
  fechaPago?: Date | null;
  bancoPago?: string | null;
  descripcionPago?: string | null;
  archivoPago?: string | null;
  montoPago?: number | null;
  estadoPago?: boolean;
}

export interface UpdatePaymentsRequest {
  entityType: EntityType;
  entityId: number;
  payments: PaymentData[];
  tipoPago?: string;
  notaPago?: string;
}

export const updatePayments = async (request: UpdatePaymentsRequest) => {
  const { entityType, entityId, payments, tipoPago, notaPago } = request;

  return await prisma.$transaction(async (tx) => {
    switch (entityType) {
      case 'ordenCompraPrivada':
        await tx.pagoOrdenCompraPrivada.deleteMany({
          where: { ordenCompraPrivadaId: entityId }
        });

        const pagoPrivadaPromises = payments.map(payment => 
          tx.pagoOrdenCompraPrivada.create({
            data: {
              ordenCompraPrivadaId: entityId,
              fechaPago: payment.fechaPago,
              bancoPago: payment.bancoPago,
              descripcionPago: payment.descripcionPago,
              archivoPago: payment.archivoPago,
              montoPago: payment.montoPago,
              estadoPago: payment.estadoPago || false
            }
          })
        );

        const nuevosPagosPrivada = await Promise.all(pagoPrivadaPromises);

        if (tipoPago !== undefined || notaPago !== undefined) {
          await tx.ordenCompraPrivada.update({
            where: { id: entityId },
            data: {
              ...(tipoPago !== undefined && { estadoPago: tipoPago as any }),
              ...(notaPago !== undefined && { notaPago })
            }
          });
        }

        return {
          entityType,
          entityId,
          payments: nuevosPagosPrivada,
          tipoPago,
          notaPago
        };

      case 'ordenProveedor':
        await tx.pagoOrdenProveedor.deleteMany({
          where: { ordenProveedorId: entityId }
        });

        const pagoProveedorPromises = payments.map(payment => 
          tx.pagoOrdenProveedor.create({
            data: {
              ordenProveedorId: entityId,
              fechaPago: payment.fechaPago,
              bancoPago: payment.bancoPago,
              descripcionPago: payment.descripcionPago,
              archivoPago: payment.archivoPago,
              montoPago: payment.montoPago,
              estadoPago: payment.estadoPago || false
            }
          })
        );

        const nuevosPagosProveedor = await Promise.all(pagoProveedorPromises);

        if (tipoPago !== undefined || notaPago !== undefined) {
          await tx.ordenProveedor.update({
            where: { id: entityId },
            data: {
              ...(tipoPago !== undefined && { tipoPago }),
              ...(notaPago !== undefined && { notaPago })
            }
          });
        }

        return {
          entityType,
          entityId,
          payments: nuevosPagosProveedor,
          tipoPago,
          notaPago
        };

      case 'transporteAsignado':
        await tx.pagoTransporteAsignado.deleteMany({
          where: { transporteAsignadoId: entityId }
        });

        const pagoTransportePromises = payments.map(payment => 
          tx.pagoTransporteAsignado.create({
            data: {
              transporteAsignadoId: entityId,
              fechaPago: payment.fechaPago,
              bancoPago: payment.bancoPago,
              descripcionPago: payment.descripcionPago,
              archivoPago: payment.archivoPago,
              montoPago: payment.montoPago,
              estadoPago: payment.estadoPago || false
            }
          })
        );

        const nuevosPagosTransporte = await Promise.all(pagoTransportePromises);

        if (tipoPago !== undefined || notaPago !== undefined) {
          await tx.transporteAsignado.update({
            where: { id: entityId },
            data: {
              ...(tipoPago !== undefined && { estadoPago: tipoPago as any }),
              ...(notaPago !== undefined && { notaPago })
            }
          });
        }

        return {
          entityType,
          entityId,
          payments: nuevosPagosTransporte,
          tipoPago,
          notaPago
        };

      default:
        throw new Error(`Tipo de entidad no soportado: ${entityType}`);
    }
  });
};

export const getPaymentsByEntity = async (entityType: EntityType, entityId: number) => {
  switch (entityType) {
    case 'ordenCompraPrivada':
      return await prisma.pagoOrdenCompraPrivada.findMany({
        where: { ordenCompraPrivadaId: entityId },
        orderBy: { createdAt: 'desc' }
      });

    case 'ordenProveedor':
      return await prisma.pagoOrdenProveedor.findMany({
        where: { ordenProveedorId: entityId },
        orderBy: { createdAt: 'desc' }
      });

    case 'transporteAsignado':
      return await prisma.pagoTransporteAsignado.findMany({
        where: { transporteAsignadoId: entityId },
        orderBy: { createdAt: 'desc' }
      });

    default:
      throw new Error(`Tipo de entidad no soportado: ${entityType}`);
  }
};
