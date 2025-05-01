import { Router } from 'express';
import {
  listCompanies,
  createCompany,
  getCompany,
  updateCompany,
  deleteCompany,
} from './company.controller';

const router = Router();

router.get('/', listCompanies);
router.post('/', createCompany);
router.get('/:companyId', getCompany);
router.put('/:companyId', updateCompany);
router.delete('/:companyId', deleteCompany);

export default router;
