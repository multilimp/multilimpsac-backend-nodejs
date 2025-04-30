import { Router } from 'express';
import {
  listTransports,
  createTransport,
  getTransport,
  updateTransport,
  deleteTransport,
} from './transport.controller';

const router = Router();

router.get('/', listTransports);
router.post('/', createTransport);
router.get('/:transportId', getTransport);
router.put('/:transportId', updateTransport);
router.delete('/:transportId', deleteTransport);

export default router;
