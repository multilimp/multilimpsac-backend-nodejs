import { GestionCobranza } from '@prisma/client';
import prisma from '../../database/prisma';
type CreateGestionCobranzaData = Omit<GestionCobranza, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateGestionCobranzaData = Partial<CreateGestionCobranzaData>;
export const getAllGestionCobranza = (): Promise<GestionCobranza[]> => {
  return prisma.gestionCobranza.findMany();
};
export const getGestionCobranzaById = (id: number): Promise<GestionCobranza | null> => {
  return prisma.gestionCobranza.findUnique({ where: { id } });
};
export const createGestionCobranza = (data: CreateGestionCobranzaData): Promise<GestionCobranza> => {
  return prisma.gestionCobranza.create({ data });
};
export const updateGestionCobranza = (id: number, data: UpdateGestionCobranzaData): Promise<GestionCobranza> => {
  return prisma.gestionCobranza.update({ where: { id }, data });
};
export const deleteGestionCobranza = (id: number): Promise<GestionCobranza> => {
  return prisma.gestionCobranza.delete({ where: { id } });
};
