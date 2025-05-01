import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError';
import * as agrupacionService from './agrupacionOrdenCompra.service';

export const listAgrupaciones = async (req: Request, res: Response) => {
  try {
    const agrupaciones = await agrupacionService.getAllAgrupaciones();
    res.status(200).json(agrupaciones);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar agrupaciones' });
  }
};

export const createAgrupacion = async (req: Request, res: Response) => {
  try {
    const newAgrupacion = await agrupacionService.createAgrupacion(req.body);
    res.status(201).json(newAgrupacion);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear agrupación' });
  }
};

export const getAgrupacion = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.agrupacionId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de agrupación inválido' });
    }
    const agrupacion = await agrupacionService.getAgrupacionById(id);
    if (!agrupacion) {
      return res.status(404).json({ message: 'Agrupación no encontrada' });
    }
    res.status(200).json(agrupacion);
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener agrupación' });
  }
};

export const updateAgrupacion = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.agrupacionId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de agrupación inválido' });
    }
    const updatedAgrupacion = await agrupacionService.updateAgrupacion(id, req.body);
    res.status(200).json(updatedAgrupacion);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar agrupación' });
  }
};

export const deleteAgrupacion = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.agrupacionId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de agrupación inválido' });
    }
    await agrupacionService.deleteAgrupacion(id);
    res.status(204).send();
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar agrupación' });
  }
};

// Controladores para añadir/quitar OCs
export const addOrdenCompra = async (req: Request, res: Response) => {
    try {
        const agrupacionId = parseInt(req.params.agrupacionId, 10);
        const { ordenCompraId } = req.body;
        if (isNaN(agrupacionId) || typeof ordenCompraId !== 'number') {
             return res.status(400).json({ message: 'IDs inválidos' });
        }
        const updatedAgrupacion = await agrupacionService.addOrdenCompraToAgrupacion(agrupacionId, ordenCompraId);
        res.status(200).json(updatedAgrupacion);
    } catch (error) {
         handleError({ res, error, msg: 'Error al añadir OC a la agrupación' });
    }
}

export const removeOrdenCompra = async (req: Request, res: Response) => {
     try {
        const agrupacionId = parseInt(req.params.agrupacionId, 10);
        // Asumiendo que el ID de la OC a quitar viene en la URL o body
        const ordenCompraId = parseInt(req.params.ordenCompraId || req.body.ordenCompraId, 10);
        if (isNaN(agrupacionId) || isNaN(ordenCompraId)) {
             return res.status(400).json({ message: 'IDs inválidos' });
        }
        const updatedAgrupacion = await agrupacionService.removeOrdenCompraFromAgrupacion(agrupacionId, ordenCompraId);
        res.status(200).json(updatedAgrupacion);
    } catch (error) {
         handleError({ res, error, msg: 'Error al quitar OC de la agrupación' });
    }
}
