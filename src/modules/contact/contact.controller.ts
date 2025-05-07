import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError';
import * as contactService from './contact.service';// Importar el enum
import { ContactoTipo } from '../../../generated/prisma';

export const listContacts = async (req: Request, res: Response) => {
  try {
    // Opcional: Filtrar por tipo o referencia si se pasan como query params
    const { tipo, clienteId, proveedorId, transporteId } = req.query;

    let contacts;
    if (clienteId) {
      contacts = await contactService.getContactsByClientId(parseInt(clienteId as string, 10));
    } else if (proveedorId) {
      contacts = await contactService.getContactsByProviderId(parseInt(proveedorId as string, 10));
    } else if (transporteId) {
      contacts = await contactService.getContactsByTransportId(parseInt(transporteId as string, 10));
    } else {
      contacts = await contactService.getAllContacts();
    }

    res.status(200).json(contacts);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar contactos' });
  }
};

export const createContact = async (req: Request, res: Response) => {
  try {
    // Validación básica (se podría usar Zod)
    const { tipo, referenciaId, ...rest } = req.body;
    if (!tipo || !referenciaId || !Object.values(ContactoTipo).includes(tipo)) {
      return res.status(400).json({ message: 'Datos de contacto inválidos: tipo y referenciaId son requeridos.' });
    }

    const newContact = await contactService.createContact({ tipo, referenciaId, ...rest });
    res.status(201).json(newContact);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear contacto' });
  }
};

export const getContact = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.contactId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de contacto inválido' });
    }
    const contact = await contactService.getContactById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Contacto no encontrado' });
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
      return res.status(400).json({ message: 'ID de contacto inválido' });
    }

    // Validación básica para actualización (si se cambia tipo, se necesita referenciaId)
    const { tipo, referenciaId } = req.body;
    if (tipo && referenciaId === undefined) {
       return res.status(400).json({ message: 'Al cambiar el tipo, se requiere referenciaId.' });
    }
    if (tipo && !Object.values(ContactoTipo).includes(tipo)) {
       return res.status(400).json({ message: 'Tipo de contacto inválido.' });
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
      return res.status(400).json({ message: 'ID de contacto inválido' });
    }
    await contactService.deleteContact(id);
    res.status(204).send();
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar contacto' });
  }
};
