import prisma from '../../database/prisma';
import { Contacto, ContactoTipo, Prisma } from '../../../prisma/generated/client';

export type ContactFilters = {
  tipo?: ContactoTipo;
  referenciaId?: number;
};

export const listContacts = async (
  page: number,
  pageSize: number,
  filters?: ContactFilters
) => {
  const where: Prisma.ContactoWhereInput = {};

  if (filters?.tipo && filters?.referenciaId !== undefined) {
    where.tipo = filters.tipo;
    where.referenciaId = filters.referenciaId;
  } else if (filters?.tipo && filters?.referenciaId === undefined) {
    where.tipo = filters.tipo;
  }


  const [contactos, total] = await prisma.$transaction([
    prisma.contacto.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { nombre: 'asc' },
    }),
    prisma.contacto.count({ where }),
  ]);

  return {
    data: contactos,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  };
};

export const createContact = async (
  data: Omit<Prisma.ContactoUncheckedCreateInput, 'id' | 'createdAt' | 'updatedAt' | 'clienteId' | 'proveedorId' | 'transporteId'> & { tipo: ContactoTipo; referenciaId: number }
): Promise<Contacto> => {
  const { tipo, referenciaId, ...restOfData } = data;

  const createInput: Prisma.ContactoUncheckedCreateInput = {
    ...restOfData,
    tipo,
    referenciaId,
  };

  if (tipo === ContactoTipo.CLIENTE) {
    createInput.clienteId = referenciaId;
  } else if (tipo === ContactoTipo.PROVEEDOR) {
    createInput.proveedorId = referenciaId;
  } else if (tipo === ContactoTipo.TRANSPORTE) {
    createInput.transporteId = referenciaId;
  } else {
    throw new Error('Tipo de contacto inválido o referenciaId faltante para la asociación.');
  }

  return prisma.contacto.create({
    data: createInput,
  });
};

export const getContactById = async (id: number): Promise<Contacto | null> => {
  return prisma.contacto.findUnique({
    where: { id },
  });
};

export const updateContact = async (
  id: number,
  data: Partial<Omit<Prisma.ContactoUncheckedUpdateInput, 'clienteId' | 'proveedorId' | 'transporteId'>> & { tipo?: ContactoTipo; referenciaId?: number }
): Promise<Contacto> => {
  const { tipo, referenciaId, ...restOfData } = data;
  const updateInput: Prisma.ContactoUncheckedUpdateInput = { ...restOfData };

  if (tipo && referenciaId !== undefined) {
    updateInput.tipo = tipo;
    updateInput.referenciaId = referenciaId;
    updateInput.clienteId = null;
    updateInput.proveedorId = null;
    updateInput.transporteId = null;

    if (tipo === ContactoTipo.CLIENTE) {
      updateInput.clienteId = referenciaId;
    } else if (tipo === ContactoTipo.PROVEEDOR) {
      updateInput.proveedorId = referenciaId;
    } else if (tipo === ContactoTipo.TRANSPORTE) {
      updateInput.transporteId = referenciaId;
    } else {
      throw new Error('Tipo de contacto inválido para la asociación en actualización.');
    }
  } else if (tipo || referenciaId) {
    throw new Error('Para actualizar la asociación del contacto, se deben proveer tanto "tipo" como "referenciaId".');
  }

  return prisma.contacto.update({
    where: { id },
    data: updateInput,
  });
};

export const deleteContact = async (id: number): Promise<Contacto> => {
  return prisma.contacto.delete({
    where: { id },
  });
};
