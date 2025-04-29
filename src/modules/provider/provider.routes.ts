import { Router } from 'express';

import { createProvider, deleteProvider, getProvider, listProviders, updateProvider } from './provider.controller';

const router = Router();

router.get('', listProviders);
router.get('/:providerId', getProvider);
router.post('', createProvider);
router.put('/:providerId', updateProvider);
router.delete('/:providerId', deleteProvider);

export default router;
