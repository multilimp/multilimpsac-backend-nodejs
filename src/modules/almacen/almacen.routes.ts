import { Router } from 'express';
import {
  listAlmacenes,
  createAlmacen,
  getAlmacen,
  updateAlmacen,
  deleteAlmacen,
} from './almacen.controller';

const router = Router();

router.get('/', listAlmacenes);
router.post('/', createAlmacen);
router.get('/:almacenId', getAlmacen);
router.put('/:almacenId', updateAlmacen);
router.delete('/:almacenId', deleteAlmacen);

export default router;
