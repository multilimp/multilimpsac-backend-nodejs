import { Transporte } from '@prisma/client';
import prisma from '../../database/prisma';


type CreateTransportData = Omit<Transporte, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateTransportData = Partial<CreateTransportData>;

export const getAllTransports = (): Promise<Transporte[]> => {
  return prisma.transporte.findMany();
};

export const getTransportById = (id: number): Promise<Transporte | null> => {
  return prisma.transporte.findUnique({
    where: { id },
  });
};

export const createTransport = (data: any): Promise<Transporte> => {
  const mappedData = {
    ruc: data.ruc,
    razonSocial: data.razon_social ?? data.razonSocial,
    direccion: data.direccion,
    telefono: data.telefono,
    email: data.email,
    estado: data.estado,
    cobertura: data.cobertura,
    departamento: data.departamento,
    provincia: data.provincia,
    distrito: data.distrito,
  };
  return prisma.transporte.create({ data: mappedData });
};

export const updateTransport = (id: number, data: any): Promise<Transporte> => {
  // Mapeo explícito de snake_case a camelCase para Prisma
  const mappedData = {
    ...(data.ruc && { ruc: data.ruc }),
    ...(data.razon_social && { razonSocial: data.razon_social }),
    ...(data.razonSocial && { razonSocial: data.razonSocial }),
    ...(data.direccion && { direccion: data.direccion }),
    ...(data.telefono !== undefined && { telefono: data.telefono }),
    ...(data.email !== undefined && { email: data.email }),
    ...(data.estado !== undefined && { estado: data.estado }),
    ...(data.cobertura && { cobertura: data.cobertura }),
    ...(data.departamento && { departamento: data.departamento }),
    ...(data.provincia && { provincia: data.provincia }),
    ...(data.distrito && { distrito: data.distrito }),
  };

  return prisma.transporte.update({
    where: { id },
    data: mappedData,
  });
};

export const deleteTransport = (id: number): Promise<Transporte> => {
  return prisma.transporte.delete({
    where: { id },
  });
};
