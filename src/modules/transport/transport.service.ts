import { Transporte } from 'generated/prisma';
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

export const updateTransport = (id: number, data: UpdateTransportData): Promise<Transporte> => {
  return prisma.transporte.update({
    where: { id },
    data,
  });
};

export const deleteTransport = (id: number): Promise<Transporte> => {
  return prisma.transporte.delete({
    where: { id },
  });
};
