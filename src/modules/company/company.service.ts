
import { Empresa } from 'generated/prisma';
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

export const createCompany = (data: CreateCompanyData): Promise<Empresa> => {
  return prisma.empresa.create({ data });
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
