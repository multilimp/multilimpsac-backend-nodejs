import { Router } from 'express';
import {
  listCotizaciones,
  createCotizacion,
  getCotizacion,
  updateCotizacion,
  deleteCotizacion,
} from './cotizacion.controller';

const router = Router();

router.get('/', listCotizaciones);
router.post('/', createCotizacion);
router.get('/:cotizacionId', getCotizacion);
router.put('/:cotizacionId', updateCotizacion);
router.delete('/:cotizacionId', deleteCotizacion);

export default router;
