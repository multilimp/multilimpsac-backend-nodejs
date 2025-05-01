import { Router } from 'express';
import { getDistricts, getProvinces, getRegions } from './ubigeo.controller';

const router = Router();

router.get('/regions', getRegions);
router.get('/provinces', getProvinces);
router.get('/districts', getDistricts);

export default router;
