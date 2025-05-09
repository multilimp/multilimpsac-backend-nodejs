import { Request, Response } from 'express';
import { handleError } from '@/shared/middleware/handleError';
import * as contactService from './contact.service';
import { ContactoTipo } from '@prisma/client';

export const listContacts = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;

    const tipoParam = req.query.tipo as string | undefined;
    const referenciaIdParam = req.query.referenciaId as string | undefined;

    const filters: contactService.ContactFilters = {};

    if (tipoParam) {
      if (!Object.values(ContactoTipo).includes(tipoParam as ContactoTipo)) {
        return res.status(400).json({ message: `Parámetro "tipo" inválido. Valores permitidos: ${Object.values(ContactoTipo).join(', ')}` });
      }
      filters.tipo = tipoParam as ContactoTipo;
    }

    if (referenciaIdParam) {
      const referenciaId = parseInt(referenciaIdParam, 10);
      if (isNaN(referenciaId)) {
        return res.status(400).json({ message: 'Parámetro "referenciaId" inválido. Debe ser un número.' });
      }
      filters.referenciaId = referenciaId;
    }

    if (filters.referenciaId !== undefined && filters.tipo === undefined) {
      return res.status(400).json({ message: 'El parámetro "tipo" es requerido cuando se provee "referenciaId".' });
    }

    const result = await contactService.listContacts(page, pageSize, filters);
    res.status(200).json(result);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar contactos' });
  }
};

export const createContact = async (req: Request, res: Response) => {
  try {
    const newContact = await contactService.createContact(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear contacto' });
  }
};

export const getContact = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.contactId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de contacto inválido.' });
    }
    const contact = await contactService.getContactById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Contacto no encontrado.' });
    }
    res.status(200).json(contact);
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener contacto' });
  }
};

export const updateContact = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.contactId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de contacto inválido.' });
    }
    const updatedContact = await contactService.updateContact(id, req.body);
    res.status(200).json(updatedContact);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar contacto' });
  }
};

export const deleteContact = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.contactId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de contacto inválido.' });
    }
    await contactService.deleteContact(id);
    res.status(204).send();
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar contacto' });
  }
};

export const listContactsByClient = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const clientId = parseInt(req.params.clientId, 10);

    if (isNaN(clientId)) {
      return res.status(400).json({ message: 'ID de cliente inválido.' });
    }

    const filters: contactService.ContactFilters = {
      tipo: ContactoTipo.CLIENTE,
      referenciaId: clientId,
    };

    const result = await contactService.listContacts(page, pageSize, filters);
    res.status(200).json(result);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar contactos por cliente' });
  }
};

export const listContactsByProvider = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const providerId = parseInt(req.params.providerId, 10);

    if (isNaN(providerId)) {
      return res.status(400).json({ message: 'ID de proveedor inválido.' });
    }

    const filters: contactService.ContactFilters = {
      tipo: ContactoTipo.PROVEEDOR,
      referenciaId: providerId,
    };

    const result = await contactService.listContacts(page, pageSize, filters);
    res.status(200).json(result);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar contactos por proveedor' });
  }
};

export const listContactsByTransport = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const transportId = parseInt(req.params.transportId, 10);

    if (isNaN(transportId)) {
      return res.status(400).json({ message: 'ID de transporte inválido.' });
    }

    const filters: contactService.ContactFilters = {
      tipo: ContactoTipo.TRANSPORTE,
      referenciaId: transportId,
    };

    const result = await contactService.listContacts(page, pageSize, filters);
    res.status(200).json(result);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar contactos por transporte' });
  }
};
