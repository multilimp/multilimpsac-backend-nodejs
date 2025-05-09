import { Catalogo } from '@prisma/client';
import prisma from '../../database/prisma';

// Tipos para los datos de entrada
type CreateCatalogData = Omit<Catalogo, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateCatalogData = Partial<CreateCatalogData>;

export const getAllCatalogs = (): Promise<Catalogo[]> => {
  return prisma.catalogo.findMany({
    include: { empresa: true }, // Incluir la empresa relacionada si es necesario
  });
};

export const getCatalogById = (id: number): Promise<Catalogo | null> => {
  return prisma.catalogo.findUnique({
    where: { id },
    include: { empresa: true }, // Incluir la empresa relacionada si es necesario
  });
};

export const createCatalog = (data: CreateCatalogData): Promise<Catalogo> => {
  // Asegúrate de que empresaId esté presente en data
  if (!data.empresaId) {
    throw new Error('El ID de la empresa (empresaId) es requerido para crear un catálogo.');
  }
  return prisma.catalogo.create({ data });
};

export const updateCatalog = (id: number, data: UpdateCatalogData): Promise<Catalogo> => {
  // Prevenir la actualización de empresaId si no se desea permitir
  // delete data.empresaId;
  return prisma.catalogo.update({
    where: { id },
    data,
  });
};

export const deleteCatalog = (id: number): Promise<Catalogo> => {
  return prisma.catalogo.delete({
    where: { id },
  });
};

// Opcional: Función para obtener catálogos por empresa
export const getCatalogsByCompanyId = (companyId: number): Promise<Catalogo[]> => {
  return prisma.catalogo.findMany({
    where: { empresaId: companyId },
  });
};
