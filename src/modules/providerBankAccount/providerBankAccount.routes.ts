import { Router } from 'express';

import {
  createProviderBankAccount,
  deleteProviderBankAccount,
  getBankAccountByProvider,
  updateProviderBankAccount,
} from './providerBankAccount.controller';

const router = Router();

router.get('/:providerId', getBankAccountByProvider);
router.post('', createProviderBankAccount);
router.put('/:providerBankAccountId', updateProviderBankAccount);
router.delete('/:providerBankAccountId', deleteProviderBankAccount);

export default router;
