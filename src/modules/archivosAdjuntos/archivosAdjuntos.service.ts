import { ArchivoAdjunto, Prisma } from '../../../prisma/generated/client';
import prisma from '../../database/prisma';

type CreateArchivoAdjuntoData = Omit<ArchivoAdjunto, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateArchivoAdjuntoData = Partial<CreateArchivoAdjuntoData>;

/**
 * Obtiene todos los archivos adjuntos de una orden de compra
 */
export const getArchivosAdjuntosByOrdenCompra = (ordenCompraId: number): Promise<ArchivoAdjunto[]> => {
    return prisma.archivoAdjunto.findMany({
        where: { ordenCompraId },
        orderBy: { createdAt: 'desc' }
    });
};

/**
 * Obtiene un archivo adjunto por ID
 */
export const getArchivoAdjuntoById = (id: number): Promise<ArchivoAdjunto | null> => {
    return prisma.archivoAdjunto.findUnique({
        where: { id }
    });
};

/**
 * Crea un nuevo archivo adjunto
 */
export const createArchivoAdjunto = (data: CreateArchivoAdjuntoData): Promise<ArchivoAdjunto> => {
    return prisma.archivoAdjunto.create({
        data
    });
};

/**
 * Actualiza un archivo adjunto
 */
export const updateArchivoAdjunto = (id: number, data: UpdateArchivoAdjuntoData): Promise<ArchivoAdjunto> => {
    return prisma.archivoAdjunto.update({
        where: { id },
        data
    });
};

/**
 * Elimina un archivo adjunto
 */
export const deleteArchivoAdjunto = (id: number): Promise<ArchivoAdjunto> => {
    return prisma.archivoAdjunto.delete({
        where: { id }
    });
};