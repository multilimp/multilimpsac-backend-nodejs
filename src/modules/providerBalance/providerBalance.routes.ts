import { Router } from 'express';

import { createProviderBalance, deleteProviderBalance, getBalanceByProvider, updateProviderBalance } from './providerBalance.controller';

const router = Router();

router.get('/:providerId', getBalanceByProvider);
router.post('', createProviderBalance);
router.put('/:providerBalanceId', updateProviderBalance);
router.delete('/:providerBalanceId', deleteProviderBalance);

export default router;
