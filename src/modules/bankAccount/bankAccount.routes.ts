import { Router } from 'express';

import {
  createBankAccount,
  deleteBankAccount,
  getBankAccount,
  listBankAccounts,
  updateBankAccount,
} from './bankAccount.controller';

const router = Router();

router.get('/', listBankAccounts); // Puede filtrar por query params ?tipo=PROVEEDOR&referenciaId=1
router.post('/', createBankAccount);
router.get('/:bankAccountId', getBankAccount);
router.put('/:bankAccountId', updateBankAccount);
router.delete('/:bankAccountId', deleteBankAccount);

export default router;
