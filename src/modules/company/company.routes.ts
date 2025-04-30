import { Router } from 'express';
import {
  listCompanies,
  createCompany,
  getCompany,
  updateCompany,
  deleteCompany,
  uploadCompanyLogo, // Importar el nuevo controlador
} from './company.controller';

const router = Router();

router.get('/', listCompanies);
router.post('/', createCompany);
router.get('/:companyId', getCompany);
router.put('/:companyId', updateCompany);
router.delete('/:companyId', deleteCompany);

// Nueva ruta para subir el logo
router.post('/:companyId/logo', uploadCompanyLogo);

export default router;
