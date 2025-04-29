import { Router } from 'express';

import { createClient, deleteClient, getClient, listClients, updateClient } from './client.controller';

const router = Router();

router.get('', listClients);
router.get('/:clientId', getClient);
router.post('', createClient);
router.put('/:clientId', updateClient);
router.delete('/:clientId', deleteClient);

export default router;
