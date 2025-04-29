import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError';
import * as providerService from './provider.service';

export const listProviders = async (req: Request, res: Response) => {
  try {
    const providers = await providerService.getAllProviders();
    res.status(200).json(providers);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar proveedores' });
  }
};

export const createProvider = async (req: Request, res: Response) => {
  try {
    const newProvider = await providerService.createProvider(req.body);
    res.status(201).json(newProvider);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear proveedor' });
  }
};

export const getProvider = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.providerId, 10);
    if (isNaN(id)) throw new Error('NOT_FOUND');

    const provider = await providerService.getProviderById(id);
    if (!provider) throw new Error('NOT_FOUND');

    res.status(200).json(provider);
  } catch (error) {
    handleError({ res, statusCode: 404, error });
  }
};

export const updateProvider = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.providerId, 10);
    if (isNaN(id)) throw new Error('NOT_FOUND');

    const updatedProvider = await providerService.updateProvider(id, req.body);
    res.status(200).json(updatedProvider);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar proveedor' });
  }
};

export const deleteProvider = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.providerId, 10);
    if (isNaN(id)) throw new Error('NOT_FOUND');

    await providerService.deleteProvider(id);

    res.status(204).send();
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar proveedor' });
  }
};
