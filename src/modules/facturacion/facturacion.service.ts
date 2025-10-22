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
// Normaliza fechas y limpia URLs/numéricos provenientes del frontend
function toDateOrNull(value: unknown): Date | null {
  if (value === undefined || value === null || value === '') return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    // Si viene solo YYYY-MM-DD, forzar inicio del día en UTC
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const d = new Date(`${trimmed}T00:00:00.000Z`);
      return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function sanitizeUrl(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const s = String(value).trim().replace(/[`]/g, '').replace(/^"|"$/g, '');
  return s.length ? s : null;
}

function toNumberOrNull(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return isNaN(n) ? null : n;
}

export const createFacturacion = (data: CreateFacturacionData): Promise<Facturacion> => {
  const payload: any = { ...data };
  payload.fechaFactura = toDateOrNull((data as any).fechaFactura);
  payload.facturaArchivo = sanitizeUrl((data as any).facturaArchivo);
  payload.grrArchivo = sanitizeUrl((data as any).grrArchivo);
  payload.notaCreditoArchivo = sanitizeUrl((data as any).notaCreditoArchivo);
  payload.retencion = toNumberOrNull((data as any).retencion);
  payload.detraccion = toNumberOrNull((data as any).detraccion);
  payload.formaEnvioFactura = (data as any).formaEnvioFactura ? String((data as any).formaEnvioFactura).trim() : null;
  payload.motivoRefacturacion = (data as any).motivoRefacturacion ? String((data as any).motivoRefacturacion).trim() : null;

  return prisma.facturacion.create({ data: payload });
};
export const updateFacturacion = (id: number, data: UpdateFacturacionData): Promise<Facturacion> => {
  const payload: any = { ...data };
  payload.fechaFactura = toDateOrNull((data as any).fechaFactura);
  payload.facturaArchivo = sanitizeUrl((data as any).facturaArchivo);
  payload.grrArchivo = sanitizeUrl((data as any).grrArchivo);
  payload.notaCreditoArchivo = sanitizeUrl((data as any).notaCreditoArchivo);
  if ('retencion' in data) payload.retencion = toNumberOrNull((data as any).retencion);
  if ('detraccion' in data) payload.detraccion = toNumberOrNull((data as any).detraccion);
  if ('formaEnvioFactura' in data) payload.formaEnvioFactura = (data as any).formaEnvioFactura ? String((data as any).formaEnvioFactura).trim() : null;
  if ('motivoRefacturacion' in data) payload.motivoRefacturacion = (data as any).motivoRefacturacion ? String((data as any).motivoRefacturacion).trim() : null;

  return prisma.facturacion.update({ where: { id }, data: payload });
};

export const partialUpdateFacturacion = (id: number, data: Partial<Facturacion>): Promise<Facturacion> => {
  const payload: any = { ...data };
  payload.fechaFactura = toDateOrNull((data as any).fechaFactura);
  payload.facturaArchivo = sanitizeUrl((data as any).facturaArchivo);
  payload.grrArchivo = sanitizeUrl((data as any).grrArchivo);
  payload.notaCreditoArchivo = sanitizeUrl((data as any).notaCreditoArchivo);
  if ('retencion' in data) payload.retencion = toNumberOrNull((data as any).retencion);
  if ('detraccion' in data) payload.detraccion = toNumberOrNull((data as any).detraccion);
  if ('formaEnvioFactura' in data) payload.formaEnvioFactura = (data as any).formaEnvioFactura ? String((data as any).formaEnvioFactura).trim() : null;
  if ('motivoRefacturacion' in data) payload.motivoRefacturacion = (data as any).motivoRefacturacion ? String((data as any).motivoRefacturacion).trim() : null;

  return prisma.facturacion.update({ where: { id }, data: payload });
};

export const deleteFacturacion = (id: number): Promise<Facturacion> => {
  return prisma.facturacion.delete({ where: { id } });
};

export const refacturarFacturacion = async (idFactura: number, data: { notaCreditoTexto?: string; notaCreditoArchivo?: string; motivoRefacturacion?: string; [key: string]: any }): Promise<Facturacion> => {
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
    notaCreditoArchivo: data.notaCreditoArchivo,
    motivoRefacturacion: data.motivoRefacturacion
  };

  // Copiar otros campos de la factura original si están presentes en data
  if (data.factura !== undefined) createData.factura = data.factura;
  if (data.fechaFactura !== undefined) createData.fechaFactura = data.fechaFactura ? new Date(data.fechaFactura) : null;
  if (data.grr !== undefined) createData.grr = data.grr;
  if (data.retencion !== undefined) createData.retencion = toNumberOrNull(data.retencion);
  if (data.detraccion !== undefined) createData.detraccion = toNumberOrNull(data.detraccion);
  if (data.formaEnvioFactura !== undefined) createData.formaEnvioFactura = data.formaEnvioFactura ? String(data.formaEnvioFactura).trim() : null;
  if (data.facturaArchivo !== undefined) createData.facturaArchivo = sanitizeUrl(data.facturaArchivo);
  if (data.grrArchivo !== undefined) createData.grrArchivo = sanitizeUrl(data.grrArchivo);

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
