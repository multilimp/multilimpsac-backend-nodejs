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

  // Preparar los datos para crear una nueva facturación
  const createData: any = {
    ordenCompraId: factura.ordenCompraId,
    esRefacturacion: true,
    idFacturaOriginal: idFactura,
    notaCreditoTexto: data.notaCreditoTexto,
    notaCreditoArchivo: data.notaCreditoArchivo
  };

  // Copiar otros campos de la factura original si están presentes en data
  if (data.factura !== undefined) createData.factura = data.factura;
  if (data.fechaFactura !== undefined) createData.fechaFactura = data.fechaFactura ? new Date(data.fechaFactura) : null;
  if (data.grr !== undefined) createData.grr = data.grr;
  if (data.retencion !== undefined) createData.retencion = data.retencion;
  if (data.detraccion !== undefined) createData.detraccion = data.detraccion;
  if (data.formaEnvioFactura !== undefined) createData.formaEnvioFactura = data.formaEnvioFactura;
  if (data.facturaArchivo !== undefined) createData.facturaArchivo = data.facturaArchivo;
  if (data.grrArchivo !== undefined) createData.grrArchivo = data.grrArchivo;

  // Si no se proporcionan valores, copiar de la factura original
  if (createData.factura === undefined) createData.factura = factura.factura;
  if (createData.fechaFactura === undefined) createData.fechaFactura = factura.fechaFactura;
  if (createData.grr === undefined) createData.grr = factura.grr;
  if (createData.retencion === undefined) createData.retencion = factura.retencion;
  if (createData.detraccion === undefined) createData.detraccion = factura.detraccion;
  if (createData.formaEnvioFactura === undefined) createData.formaEnvioFactura = factura.formaEnvioFactura;
  if (createData.facturaArchivo === undefined) createData.facturaArchivo = factura.facturaArchivo;
  if (createData.grrArchivo === undefined) createData.grrArchivo = factura.grrArchivo;

  // Crear la nueva facturación
  return prisma.facturacion.create({
    data: createData
  });
};
