import { Router } from 'express';
import {
  listContacts,
  createContact,
  getContact,
  updateContact,
  deleteContact,
  listContactsByClient,
  listContactsByProvider,
  listContactsByTransport,
} from './contact.controller';

// Opcional: Si decides añadir validación con Zod u otra librería
// import { validateCreateContact, validateUpdateContact, validateListContacts } from './contact.validation';

const router = Router();

router.get('/', listContacts); // Podrías añadir validateListContacts aquí
router.post('/', createContact); // Podrías añadir validateCreateContact aquí
router.get('/:contactId', getContact);
router.put('/:contactId', updateContact); // Podrías añadir validateUpdateContact aquí
router.delete('/:contactId', deleteContact);

router.get('/client/:clientId', listContactsByClient);
router.get('/provider/:providerId', listContactsByProvider);
router.get('/transport/:transportId', listContactsByTransport);
// router.get('/company/:companyId', getContact);

export default router;
