import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError';
import * as providerBalanceService from './providerBalance.service';

export const getBalanceByProvider = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.providerId, 10);
    if (isNaN(id)) throw new Error('NOT_FOUND');

    const providerBalance = await providerBalanceService.getBalanceByProvider(id);
    if (!providerBalance) throw new Error('NOT_FOUND');

    res.status(200).json(providerBalance);
  } catch (error) {
    handleError({ res, statusCode: 404, error });
  }
};

export const createProviderBalance = async (req: Request, res: Response) => {
  try {
    const newProviderBalance = await providerBalanceService.createProviderBalance(req.body);
    res.status(201).json(newProviderBalance);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear saldo del proveedor' });
  }
};

export const updateProviderBalance = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.providerBalanceId, 10);
    if (isNaN(id)) throw new Error('NOT_FOUND');

    const updatedProviderBalance = await providerBalanceService.updateProviderBalance(id, req.body);
    res.status(200).json(updatedProviderBalance);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar saldo del proveedor' });
  }
};

export const deleteProviderBalance = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.providerBalanceId, 10);
    if (isNaN(id)) throw new Error('NOT_FOUND');

    await providerBalanceService.deleteProviderBalance(id);

    res.status(204).send();
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar saldo del proveedor' });
  }
};
