import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError';
import * as transportService from './transport.service';

export const listTransports = async (req: Request, res: Response) => {
  try {
    const transports = await transportService.getAllTransports();
    res.status(200).json(transports);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar transportes' });
  }
};

export const createTransport = async (req: Request, res: Response) => {
  try {
    // Validación del body podría ir aquí
    const newTransport = await transportService.createTransport(req.body);
    res.status(201).json(newTransport);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear transporte' });
  }
};

export const getTransport = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.transportId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de transporte inválido' });
    }
    const transport = await transportService.getTransportById(id);
    if (!transport) {
      return res.status(404).json({ message: 'Transporte no encontrado' });
    }
    res.status(200).json(transport);
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener transporte' });
  }
};

export const updateTransport = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.transportId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de transporte inválido' });
    }
    // Validación del body podría ir aquí
    const updatedTransport = await transportService.updateTransport(id, req.body);
    res.status(200).json(updatedTransport);
  } catch (error) {
    // Manejar error si el transporte no existe
    handleError({ res, error, msg: 'Error al actualizar transporte' });
  }
};

export const deleteTransport = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.transportId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de transporte inválido' });
    }
    await transportService.deleteTransport(id);
    res.status(204).send();
  } catch (error) {
    // Manejar error si el transporte no existe
    handleError({ res, error, msg: 'Error al eliminar transporte' });
  }
};
