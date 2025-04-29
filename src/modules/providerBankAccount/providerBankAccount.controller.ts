import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError';
import * as providerBankAccountService from './providerBankAccount.service';

export const getBankAccountByProvider = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.providerId, 10);
    if (isNaN(id)) throw new Error('NOT_FOUND');

    const providerBankAccount = await providerBankAccountService.getBankAccountByProvider(id);
    if (!providerBankAccount) throw new Error('NOT_FOUND');

    res.status(200).json(providerBankAccount);
  } catch (error) {
    handleError({ res, statusCode: 404, error });
  }
};

export const createProviderBankAccount = async (req: Request, res: Response) => {
  try {
    const newProviderBankAccount = await providerBankAccountService.createProviderBankAccount(req.body);
    res.status(201).json(newProviderBankAccount);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear cuenta bancaria del proveedor' });
  }
};

export const updateProviderBankAccount = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.providerBankAccountId, 10);
    if (isNaN(id)) throw new Error('NOT_FOUND');

    const updatedProviderBankAccount = await providerBankAccountService.updateProviderBankAccount(id, req.body);
    res.status(200).json(updatedProviderBankAccount);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar cuenta bancaria del proveedor' });
  }
};

export const deleteProviderBankAccount = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.providerBankAccountId, 10);
    if (isNaN(id)) throw new Error('NOT_FOUND');

    await providerBankAccountService.deleteProviderBankAccount(id);

    res.status(204).send();
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar cuenta bancaria del proveedor' });
  }
};
