import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SeguimientoService {
  static async updateEstadoOpSeguimiento(ordenProveedorId: number, estado: string, usuarioId: number) {
    try {
      const ordenProveedor = await prisma.ordenProveedor.findUniqueOrThrow({
        where: { id: ordenProveedorId }
      });      // Por ahora usamos el campo 'estado' existente hasta que se migre la BD
      const result = await prisma.ordenProveedor.update({
        where: { id: ordenProveedorId },
        data: { 
          // estadoOp: estado,
          updatedAt: new Date()
        }
      });

      // TODO: Crear entrada en historial cuando se migre el modelo

      return result;
    } catch (error) {
      throw new Error(`Error al actualizar estado de seguimiento: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  static async marcarOpCompletado(ordenProveedorId: number, usuarioId: number) {
    try {      // Por ahora usamos el campo 'estadoOp' existente
      const result = await prisma.ordenProveedor.update({
        where: { id: ordenProveedorId },
        data: { 
          estadoOp: 'COMPLETADO',
          updatedAt: new Date()
        }
      });

      // TODO: Crear entrada en historial cuando se migre el modelo

      return result;
    } catch (error) {
      throw new Error(`Error al marcar OP como completada: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  static async updateFechaEntregaReal(ordenProveedorId: number, fechaEntrega: Date, usuarioId: number) {
    try {
      const ordenProveedor = await prisma.ordenProveedor.findUniqueOrThrow({
        where: { id: ordenProveedorId }
      });      // Por ahora usamos el campo 'fechaEntrega' existente (como string)
      const result = await prisma.ordenProveedor.update({
        where: { id: ordenProveedorId },
        data: { 
          fechaEntrega: fechaEntrega.toISOString(),
          updatedAt: new Date()
        }
      });

      // TODO: Crear entrada en historial cuando se migre el modelo

      return result;
    } catch (error) {
      throw new Error(`Error al actualizar fecha de entrega: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  static async subirDocumentoEntregaCompleto(ordenProveedorId: number, documentoUrl: string, usuarioId: number) {
    try {
      // Por ahora añadimos observaciones sobre el documento hasta que se migre la BD
      const result = await prisma.ordenProveedor.update({
        where: { id: ordenProveedorId },
        data: { 
          observaciones: `Documento de entrega completo: ${documentoUrl}`,
          updatedAt: new Date()
        }
      });

      // TODO: Usar campo documentoEntregaCompletoUrl cuando se migre el modelo

      return result;
    } catch (error) {
      throw new Error(`Error al subir documento: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  static async getHistorialModificaciones(ordenProveedorId: number) {
    try {
      // TODO: Implementar cuando se migre el modelo HistorialModificacionesOp
      // Por ahora retornamos un array vacío
      return [];
    } catch (error) {
      throw new Error(`Error al obtener historial: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  static async getOpsPendientesSeguimiento() {
    try {
      const ops = await prisma.ordenProveedor.findMany({
        where: {
          OR: [
            { estadoOp: 'PENDIENTE' },
            { estadoOp: 'EN_PROCESO' }
          ]
        },
        include: {
          proveedor: {
            select: {
              id: true,
              razonSocial: true,
              ruc: true
            }
          },          ordenCompra: {
            select: {
              id: true,
              // fechaCreacion no existe en el modelo actual, usamos createdAt
              createdAt: true,
              cliente: {
                select: {
                  id: true,
                  razonSocial: true,
                  ruc: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      return ops;
    } catch (error) {
      throw new Error(`Error al obtener OPs pendientes: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
