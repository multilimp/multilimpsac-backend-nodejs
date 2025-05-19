import { OrdenCompraPrivada, PagoOrdenCompraPrivada, Prisma } from '@prisma/client';
import prisma from '../../database/prisma';
type CreateOrdenCompraPrivadaData = Omit<OrdenCompraPrivada, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateOrdenCompraPrivadaData = Partial<CreateOrdenCompraPrivadaData>;
export const getAllOrdenCompraPrivada = (): Promise<OrdenCompraPrivada[]> => {
  return prisma.ordenCompraPrivada.findMany();
};
export const getOrdenCompraPrivadaById = (id: number): Promise<OrdenCompraPrivada | null> => {
  return prisma.ordenCompraPrivada.findUnique({ where: { id } });
};
type CreateOrdenCompraPrivadaInput = {
  ordenCompra: Prisma.OrdenCompraCreateInput;
  ordenCompraPrivada: Omit<OrdenCompraPrivada, 'id' | 'createdAt' | 'updatedAt' | 'ordenCompraId'>;
  pagos?: Omit<PagoOrdenCompraPrivada, 'id' | 'createdAt' | 'updatedAt' | 'ordenCompraPrivadaId'>[];
};
export const createOrdenCompraPrivada = async (data: CreateOrdenCompraPrivadaInput): Promise<OrdenCompraPrivada> => {
  return prisma.$transaction(async (tx) => {
    // 1. Crear la orden de compra principal
    const ordenCompra = await tx.ordenCompra.create({ data: data.ordenCompra });
    // 2. Crear la orden de compra privada vinculada
    const ordenCompraPrivada = await tx.ordenCompraPrivada.create({
      data: {
        ...data.ordenCompraPrivada,
        ordenCompraId: ordenCompra.id,
      },
    });
    // 3. Si hay pagos, insertarlos
    if (data.pagos && Array.isArray(data.pagos) && data.pagos.length > 0) {
      for (const pago of data.pagos) {
        await tx.pagoOrdenCompraPrivada.create({
          data: {
            ...pago,
            ordenCompraPrivadaId: ordenCompraPrivada.id,
          },
        });
      }
    }
    return ordenCompraPrivada;
  });
};
export const updateOrdenCompraPrivada = (id: number, data: UpdateOrdenCompraPrivadaData): Promise<OrdenCompraPrivada> => {
  return prisma.ordenCompraPrivada.update({ where: { id }, data });
};
export const deleteOrdenCompraPrivada = (id: number): Promise<OrdenCompraPrivada> => {
  return prisma.ordenCompraPrivada.delete({ where: { id } });
};
