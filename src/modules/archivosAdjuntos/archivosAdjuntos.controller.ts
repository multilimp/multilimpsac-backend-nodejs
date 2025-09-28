import { Request, Response } from 'express';
import * as service from './archivosAdjuntos.service';
import { handleError } from '../../shared/middleware/handleError';

/**
 * Lista todos los archivos adjuntos de una orden de compra
 */
export const listArchivosAdjuntosByOrdenCompra = async (req: Request, res: Response) => {
    try {
        const ordenCompraId = parseInt(req.params.ordenCompraId, 10);
        if (isNaN(ordenCompraId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de orden de compra inválido'
            });
        }

        const items = await service.getArchivosAdjuntosByOrdenCompra(ordenCompraId);
        res.status(200).json({
            success: true,
            data: items
        });
    } catch (error) {
        handleError({ res, error, msg: 'Error al listar archivos adjuntos' });
    }
};

/**
 * Obtiene un archivo adjunto por ID
 */
export const getArchivoAdjunto = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const item = await service.getArchivoAdjuntoById(id);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Archivo adjunto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: item
        });
    } catch (error) {
        handleError({ res, error, msg: 'Error al obtener archivo adjunto' });
    }
};

/**
 * Crea un nuevo archivo adjunto
 */
export const createArchivoAdjunto = async (req: Request, res: Response) => {
    try {
        // Validar campos requeridos
        const { ordenCompraId, nombre, url, tipo, tamano } = req.body;

        if (!ordenCompraId || !nombre || !url || !tipo || tamano === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Campos requeridos: ordenCompraId, nombre, url, tipo, tamano'
            });
        }

        const item = await service.createArchivoAdjunto(req.body);
        res.status(201).json({
            success: true,
            message: 'Archivo adjunto creado exitosamente',
            data: item
        });
    } catch (error) {
        handleError({ res, error, msg: 'Error al crear archivo adjunto' });
    }
};

/**
 * Actualiza un archivo adjunto
 */
export const updateArchivoAdjunto = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const item = await service.updateArchivoAdjunto(id, req.body);
        res.status(200).json({
            success: true,
            message: 'Archivo adjunto actualizado exitosamente',
            data: item
        });
    } catch (error) {
        handleError({ res, error, msg: 'Error al actualizar archivo adjunto' });
    }
};

/**
 * Elimina un archivo adjunto
 */
export const deleteArchivoAdjunto = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        await service.deleteArchivoAdjunto(id);
        res.status(200).json({
            success: true,
            message: 'Archivo adjunto eliminado exitosamente'
        });
    } catch (error) {
        handleError({ res, error, msg: 'Error al eliminar archivo adjunto' });
    }
};