import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError';
import * as clientService from './client.service';

export const listClients = async (req: Request, res: Response) => {
  try {
    const clients = await clientService.getAllClients();
    res.status(200).json(clients);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar usuarios' });
  }
};

export const createClient = async (req: Request, res: Response) => {
  try {
    const newClient = await clientService.createClient(req.body);
    res.status(201).json(newClient);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear usuario' });
  }
};

export const getClient = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.clientId, 10);
    if (isNaN(id)) throw new Error('NOT_FOUND');

    const client = await clientService.getClientById(id);
    if (!client) throw new Error('NOT_FOUND');

    res.status(200).json(client);
  } catch (error) {
    handleError({ res, statusCode: 404, error });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.clientId, 10);
    if (isNaN(id)) throw new Error('NOT_FOUND');

    const updatedClient = await clientService.updateClient(id, req.body);
    res.status(200).json(updatedClient);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar usuario' });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.clientId, 10);
    if (isNaN(id)) throw new Error('NOT_FOUND');

    await clientService.deleteClient(id);

    res.status(204).send();
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar usuario' });
  }
};
