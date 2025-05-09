
import { Empresa } from '@prisma/client';
import prisma from '../../database/prisma';

type CreateCompanyData = Omit<Empresa, 'id' | 'createdAt' | 'updatedAt'>;
// Incluir logoUrl como campo opcional en UpdateCompanyData
type UpdateCompanyData = Partial<CreateCompanyData & { logoUrl: string | null }>;

export const getAllCompanies = (): Promise<Empresa[]> => {
  return prisma.empresa.findMany();
};

export const getCompanyById = (id: number): Promise<Empresa | null> => {
  return prisma.empresa.findUnique({
    where: { id },
  });
};

export const createCompany = (data: any): Promise<Empresa> => {
  const mappedData = {
    ruc: data.ruc,
    razonSocial: data.razon_social ?? data.razonSocial,
    direccion: data.direccion,
    telefono: data.telefono,
    email: data.email,
    departamento: data.departamento,
    provincia: data.provincia,
    distrito: data.distrito,
    logo: data.logo,
    direcciones: data.direcciones,
    web: data.web,
  };
  return prisma.empresa.create({ data: mappedData });
};

export const updateCompany = (id: number, data: UpdateCompanyData): Promise<Empresa> => {
  return prisma.empresa.update({
    where: { id },
    data,
  });
};

export const deleteCompany = (id: number): Promise<Empresa> => {
  return prisma.empresa.delete({
    where: { id },
  });
};
