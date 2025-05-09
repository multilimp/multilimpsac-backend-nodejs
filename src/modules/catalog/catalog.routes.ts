import { Router } from 'express';
import {
  listCatalogs,
  createCatalog,
  getCatalog,
  updateCatalog,
  deleteCatalog,
  listCatalogsByCompany,
} from './catalog.controller';

// Opcional: Añadir middleware de validación si se crea
// import { validateCreateCatalog, validateUpdateCatalog } from './catalog.validation';

const router = Router();

// Rutas para Catálogos
router.get('/', listCatalogs);
// router.post('/', validateCreateCatalog, createCatalog);
router.post('/', createCatalog);
router.get('/:catalogId', getCatalog);
// router.put('/:catalogId', validateUpdateCatalog, updateCatalog);
router.put('/:catalogId', updateCatalog);
router.delete('/:catalogId', deleteCatalog);
router.get('/company/:companyId', listCatalogsByCompany);

export default router;
