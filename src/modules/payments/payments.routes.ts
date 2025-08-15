import { Router } from 'express';
import * as controller from './payments.controller';

const router = Router();

router.patch('/update', controller.updatePayments);
router.get('/:entityType/:entityId', controller.getPaymentsByEntity);

export default router;
