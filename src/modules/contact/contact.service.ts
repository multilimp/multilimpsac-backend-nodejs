import { Contacto, ContactoTipo, Prisma } from 'generated/prisma';
import prisma from '../../database/prisma';
import logger from '../../shared/config/logger';

// Tipo base omitiendo campos generados y relacionales directos que se infieren
type BaseContactData = Omit<Contacto, 'id' | 'createdAt' | 'updatedAt' | 'clienteId' | 'proveedorId' | 'transporteId'>;

// Tipo para creación: referenciaId es obligatorio
export type CreateContactData = BaseContactData & {
  referenciaId: number; // ID del Cliente, Proveedor o Transporte
};

// Tipo para actualización: todos los campos son opcionales
export type UpdateContactData = Partial<CreateContactData>;

export const getAllContacts = (): Promise<Contacto[]> => {
  return prisma.contacto.findMany();
};

export const getContactById = (id: number): Promise<Contacto | null> => {
  return prisma.contacto.findUnique({
    where: { id },
  });
};

// Función auxiliar para construir los datos de relación
const buildRelationData = (tipo: ContactoTipo, referenciaId: number): { clienteId?: number; proveedorId?: number; transporteId?: number } => {
  switch (tipo) {
    case ContactoTipo.CLIENTE:
      return { clienteId: referenciaId };
    case ContactoTipo.PROVEEDOR:
      return { proveedorId: referenciaId };
    case ContactoTipo.TRANSPORTE:
      return { transporteId: referenciaId };
    default:
      // Manejar caso inesperado, aunque TypeScript debería prevenirlo con enums
      logger.error(`Tipo de contacto desconocido: ${tipo}`);
      throw new Error('Tipo de contacto inválido');
  }
};

export const createContact = (data: CreateContactData): Promise<Contacto> => {
  const { tipo, referenciaId, ...restData } = data;
  const relationData = buildRelationData(tipo, referenciaId);

  return prisma.contacto.create({
    data: {
      ...restData,
      tipo,
      referenciaId, // Guardamos referenciaId también por si es útil
      ...relationData, // Añade clienteId, proveedorId o transporteId
    },
  });
};

export const updateContact = async (id: number, data: UpdateContactData): Promise<Contacto> => {
  const { tipo: newTipo, referenciaId: newReferenciaId, ...restData } = data;
  let finalData: Prisma.ContactoUpdateInput = { ...restData };

  // Si se intenta modificar la relación (tipo o referenciaId)
  if (newTipo !== undefined || newReferenciaId !== undefined) {
    const currentContact = await prisma.contacto.findUnique({
      where: { id },
      select: { tipo: true, referenciaId: true },
    });

    if (!currentContact) {
      throw new Error('Contacto no encontrado para actualizar.');
    }

    // Determinar el tipo y referenciaId finales
    const finalTipo = newTipo !== undefined ? newTipo : currentContact.tipo;
    const finalReferenciaId = newReferenciaId !== undefined ? newReferenciaId : currentContact.referenciaId;

    // Validar que el tipo final sea válido
    if (!Object.values(ContactoTipo).includes(finalTipo)) {
      throw new Error(`Tipo de contacto inválido: ${finalTipo}`);
    }

    // Calcular los nuevos datos de relación
    const relationData = buildRelationData(finalTipo, finalReferenciaId);

    // Añadir los datos actualizados, asegurando limpiar relaciones antiguas
    finalData = {
      ...finalData,
      tipo: finalTipo,
      referenciaId: finalReferenciaId,
      clienteId: null, // Limpiar relaciones primero
      proveedorId: null,
      transporteId: null,
      ...relationData, // Aplicar la nueva relación
    };
  } else {
    // Si no se modifica la relación, solo actualizar el resto de datos
    finalData = { ...restData };
  }

  return prisma.contacto.update({
    where: { id },
    data: finalData,
  });
};

export const deleteContact = (id: number): Promise<Contacto> => {
  return prisma.contacto.delete({
    where: { id },
  });
};

// Podrías añadir funciones para buscar contactos por cliente, proveedor o transporte
export const getContactsByClientId = (clientId: number): Promise<Contacto[]> => {
  return prisma.contacto.findMany({
    where: { clienteId: clientId }, // Corregido: usar clientId
  });
};

export const getContactsByProviderId = (providerId: number): Promise<Contacto[]> => {
  return prisma.contacto.findMany({
    where: { proveedorId: providerId }, // Corregido: usar proveedorId
  });
};

export const getContactsByTransportId = (transportId: number): Promise<Contacto[]> => {
  return prisma.contacto.findMany({
    where: { transporteId: transportId }, // Corregido: usar transporteId
  });
};
