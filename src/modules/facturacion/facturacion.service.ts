import { Facturacion } from '@prisma/client';
import prisma from '../../database/prisma';
type CreateFacturacionData = Omit<Facturacion, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateFacturacionData = Partial<CreateFacturacionData>;
export const getAllFacturacion = (): Promise<Facturacion[]> => {
  return prisma.facturacion.findMany();
};
export const getFacturacionById = (id: number): Promise<Facturacion | null> => {
  return prisma.facturacion.findUnique({ where: { id } });
};

export const getFacturacionesByOrdenCompraId = (ordenCompraId: number): Promise<Facturacion[]> => {
  return prisma.facturacion.findMany({
    where: { ordenCompraId },
    orderBy: { createdAt: 'desc' }
  });
};
export const createFacturacion = (data: CreateFacturacionData): Promise<Facturacion> => {
  return prisma.facturacion.create({ data });
};
export const updateFacturacion = (id: number, data: UpdateFacturacionData): Promise<Facturacion> => {
  return prisma.facturacion.update({ where: { id }, data });
};

export const partialUpdateFacturacion = (id: number, data: Partial<Facturacion>): Promise<Facturacion> => {
  return prisma.facturacion.update({ where: { id }, data });
};

export const deleteFacturacion = (id: number): Promise<Facturacion> => {
  return prisma.facturacion.delete({ where: { id } });
};

export const refacturarFacturacion = async (idFactura: number, data: { notaCreditoTexto?: string; notaCreditoArchivo?: string;[key: string]: any }): Promise<Facturacion> => {
  // Verificar que la factura existe
  const factura = await prisma.facturacion.findUnique({
    where: { id: idFactura }
  });

  if (!factura) {
    throw new Error('Factura no encontrada');
  }

  // Preparar los datos para actualizar
  const updateData: any = {
    esRefacturacion: true,
    notaCreditoTexto: data.notaCreditoTexto,
    notaCreditoArchivo: data.notaCreditoArchivo
  };

  // Agregar otros campos si están presentes
  if (data.factura !== undefined) updateData.factura = data.factura;
  if (data.fechaFactura !== undefined) updateData.fechaFactura = data.fechaFactura ? new Date(data.fechaFactura) : null;
  if (data.grr !== undefined) updateData.grr = data.grr;
  if (data.retencion !== undefined) updateData.retencion = data.retencion;
  if (data.detraccion !== undefined) updateData.detraccion = data.detraccion;
  if (data.formaEnvioFactura !== undefined) updateData.formaEnvioFactura = data.formaEnvioFactura;
  if (data.facturaArchivo !== undefined) updateData.facturaArchivo = data.facturaArchivo;
  if (data.grrArchivo !== undefined) updateData.grrArchivo = data.grrArchivo;

  // Actualizar la facturación con todos los campos
  return prisma.facturacion.update({
    where: { id: idFactura },
    data: updateData
  });
};
