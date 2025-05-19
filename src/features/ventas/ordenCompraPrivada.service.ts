import { OrdenCompraPrivada, PagoOrdenCompraPrivada, Prisma } from '@prisma/client';
import prisma from '../../database/prisma';
import * as ocService from '../../modules/ordenCompra/ordenCompra.service';

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
    const empresaId = data.ordenCompra.empresa?.connect?.id;
    if (!empresaId) throw new Error('Se requiere el ID de la empresa para generar el código de venta');
    const codigoVenta = await ocService.generateUniqueOrdenCompraCode(empresaId);
    const ordenCompraData = { ...data.ordenCompra, codigoVenta };
    const ordenCompra = await tx.ordenCompra.create({ data: ordenCompraData });
    const ordenCompraPrivada = await tx.ordenCompraPrivada.create({
      data: {
        ...data.ordenCompraPrivada,
        ordenCompraId: ordenCompra.id,
      },
    });
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
