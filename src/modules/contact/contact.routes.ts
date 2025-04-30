import { Router } from 'express';
import {
  listContacts,
  createContact,
  getContact,
  updateContact,
  deleteContact,
} from './contact.controller';

// Opcional: Añadir middleware de validación si se crea
// import { validateCreateContact, validateUpdateContact } from './contact.validation';

const router = Router();

// Rutas para Contactos
router.get('/', listContacts);
// router.post('/', validateCreateContact, createContact);
router.post('/', createContact);
router.get('/:contactId', getContact);
// router.put('/:contactId', validateUpdateContact, updateContact);
router.put('/:contactId', updateContact);
router.delete('/:contactId', deleteContact);

export default router;
