import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError';
import * as bankAccountService from './bankAccount.service';
import { CuentaBancariaTipo } from 'generated/prisma';

export const listBankAccounts = async (req: Request, res: Response) => {
  try {
    const { tipo, referenciaId } = req.query;
    let filters: { tipo?: CuentaBancariaTipo; referenciaId?: number } = {};

    if (tipo && Object.values(CuentaBancariaTipo).includes(tipo as CuentaBancariaTipo)) {
      filters.tipo = tipo as CuentaBancariaTipo;
      if (referenciaId) {
        const refId = parseInt(referenciaId as string, 10);
        if (!isNaN(refId)) {
          filters.referenciaId = refId;
        } else {
           return res.status(400).json({ message: 'referenciaId inválido.' });
        }
      } else if (filters.tipo) {
         // Si se especifica tipo pero no referenciaId, podría listar todas las de ese tipo
         // O requerir referenciaId. Por ahora, lo permitimos.
      }
    } else if (referenciaId) {
        return res.status(400).json({ message: 'Se requiere especificar un tipo válido junto con referenciaId.' });
    }


    const bankAccounts = await bankAccountService.getAllBankAccounts(filters);
    res.status(200).json(bankAccounts);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar cuentas bancarias' });
  }
};


export const createBankAccount = async (req: Request, res: Response) => {
  try {
    const { tipoCuenta, referenciaId, ...rest } = req.body;
    if (!tipoCuenta || !referenciaId || !Object.values(CuentaBancariaTipo).includes(tipoCuenta)) {
      return res.status(400).json({ message: 'Datos inválidos: tipoCuenta y referenciaId son requeridos.' });
    }
    const newBankAccount = await bankAccountService.createBankAccount({ tipoCuenta, referenciaId, ...rest });
    res.status(201).json(newBankAccount);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear cuenta bancaria' });
  }
};

export const getBankAccount = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.bankAccountId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de cuenta bancaria inválido' });
    }
    const bankAccount = await bankAccountService.getBankAccountById(id);
    if (!bankAccount) {
      return res.status(404).json({ message: 'Cuenta bancaria no encontrada' });
    }
    res.status(200).json(bankAccount);
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener cuenta bancaria' });
  }
};

export const updateBankAccount = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.bankAccountId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de cuenta bancaria inválido' });
    }

    const { tipoCuenta, referenciaId } = req.body;
    if (tipoCuenta && referenciaId === undefined) {
       return res.status(400).json({ message: 'Al cambiar el tipoCuenta, se requiere referenciaId.' });
    }
    if (tipoCuenta && !Object.values(CuentaBancariaTipo).includes(tipoCuenta)) {
       return res.status(400).json({ message: 'Tipo de cuenta bancaria inválido.' });
    }


    const updatedBankAccount = await bankAccountService.updateBankAccount(id, req.body);
    res.status(200).json(updatedBankAccount);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar cuenta bancaria' });
  }
};

export const deleteBankAccount = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.bankAccountId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de cuenta bancaria inválido' });
    }
    await bankAccountService.deleteBankAccount(id);
    res.status(204).send();
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar cuenta bancaria' });
  }
};
