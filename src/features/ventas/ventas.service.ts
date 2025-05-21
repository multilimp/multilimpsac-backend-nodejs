import { OrdenCompra, OrdenCompraPrivada, Prisma } from '@prisma/client';
import prisma from '../../database/prisma';
import * as ocService from '../../modules/ordenCompra/ordenCompra.service';
import { BaseVentaService } from '../../shared/services/baseVenta.service';
import logger from '../../shared/config/logger';

class VentaService extends BaseVentaService<OrdenCompra, Prisma.OrdenCompraCreateInput, Prisma.OrdenCompraUpdateInput> {
  protected model = prisma.ordenCompra;
}

export const ventaService = new VentaService();

export const getAllVentas = async (
  page: number,
  pageSize: number,
  filters?: {
    clienteId?: number;
    minPrice?: number;
    maxPrice?: number;
    fechaFrom?: string;
    fechaTo?: string;
    search?: string;
  }
): Promise<{ data: OrdenCompra[]; total: number; totalPages: number }> => {
  const skip = (page - 1) * pageSize;

  const where: Prisma.OrdenCompraWhereInput = {};

  if (filters?.clienteId) where.clienteId = filters.clienteId;
  if (filters?.minPrice || filters?.maxPrice) {
    where.montoVenta = {};
    if (filters.minPrice) where.montoVenta.gte = filters.minPrice;
    if (filters.maxPrice) where.montoVenta.lte = filters.maxPrice;
  }
  if (filters?.fechaFrom || filters?.fechaTo) {
    where.fechaEmision = {};
    if (filters.fechaFrom) where.fechaEmision.gte = new Date(filters.fechaFrom);
    if (filters.fechaTo) where.fechaEmision.lte = new Date(filters.fechaTo);
  }
  if (filters?.search) {
    where.OR = [
      { codigoVenta: { contains: filters.search, mode: 'insensitive' } },
      { cliente: { razonSocial: { contains: filters.search, mode: 'insensitive' } } }
    ];
  }
  where.estadoActivo = true;
  const total = await ocService.getAllOrdenesCompra({ where }).then(list => list.length);

  const args: Prisma.OrdenCompraFindManyArgs = {
    where,
    skip,
    take: pageSize,
    orderBy: { id: 'desc' },
    include: {
      empresa: true,
      cliente: true,
      contactoCliente: true,
      catalogoEmpresa: true,
      ordenesProveedor: true
    }
  };

  const data = await ocService.getAllOrdenesCompra(args);
  const totalPages = Math.ceil(total / pageSize);

  return { data, total, totalPages };
};

export const getVentaById = (
  id: number
): Promise<OrdenCompra | null> => {
  return prisma.ordenCompra.findUnique({
    where: { id },
    include: {
      empresa: true,
      cliente: true,
      contactoCliente: true,
      catalogoEmpresa: true,
      ordenesProveedor: true,
      ordenCompraPrivada: true,
      facturaciones: true,
      gestionCobranzas: true,
      OrdenCompraAgrupada: true
    }
  });
};

export const createVenta = async (data: Prisma.OrdenCompraCreateInput): Promise<OrdenCompra> => {
  try {
    // 1. Validar que exista empresa
    const empresaId = data.empresa?.connect?.id;
    logger.info('EmpresaId recibido:', empresaId);
    if (!empresaId) {
      throw new Error('Se requiere el ID de la empresa');
    }

    // 2. Generar código único de venta
    const codigoVenta = await ocService.generateUniqueOrdenCompraCode(empresaId);
    logger.info('Código de venta generado:', codigoVenta);

    // 3. Preparar los datos para la creación
    const ventaData: Prisma.OrdenCompraCreateInput = {
      empresa: { connect: { id: empresaId } },
      cliente: data.cliente,
      contactoCliente: data.contactoCliente,
      catalogoEmpresa: data.catalogoEmpresa,

      // Datos básicos
      codigoVenta,
      ventaPrivada: data.ventaPrivada ?? false,

      // Datos de entrega
      departamentoEntrega: data.departamentoEntrega,
      provinciaEntrega: data.provinciaEntrega,
      distritoEntrega: data.distritoEntrega,
      direccionEntrega: data.direccionEntrega,
      referenciaEntrega: data.referenciaEntrega,
      fechaEntrega: data.fechaEntrega ? new Date(data.fechaEntrega as any) : undefined,

      // Datos de formulario y SIAF
      fechaForm: data.fechaForm ? new Date(data.fechaForm as any) : undefined,
      fechaMaxForm: data.fechaMaxForm ? new Date(data.fechaMaxForm as any) : undefined,
      montoVenta: typeof data.montoVenta === 'string' ? parseFloat(data.montoVenta) : data.montoVenta,
      siaf: data.siaf,
      etapaSiaf: data.etapaSiaf,
      fechaSiaf: data.fechaSiaf ? new Date(data.fechaSiaf as any) : undefined,

      // Documentos
      documentoOce: data.documentoOce,
      documentoOcf: data.documentoOcf,

      // Productos y estado
      productos: data.productos ,
      etapaActual: 'creacion',
      estadoActivo: true,
      fechaEmision: new Date()
    };

    logger.info('Datos finales para crear venta:', ventaData);

    // 4. Crear la venta
    return ocService.createOrdenCompra(ventaData);
  } catch (error) {
    logger.error('Error en createVenta:', error);
    if (error instanceof Error) {
      throw new Error(`Error al crear la venta: ${error.message}`);
    }
    throw new Error('Error desconocido al crear la venta');
  }
};

export const updateVenta = (
  id: number,
  data: Prisma.OrdenCompraUpdateInput
): Promise<OrdenCompra> => {
  return ocService.updateOrdenCompra(id, data);
};

export const deleteVenta = (
  id: number
): Promise<OrdenCompra> => {
  return ocService.updateOrdenCompra(id, { estadoActivo: false });
};

export const createOrdenCompraPrivada = async (
  data: Omit<Prisma.OrdenCompraPrivadaCreateInput, 'id' | 'createdAt' | 'updatedAt'> & { pagos?: Omit<Prisma.PagoOrdenCompraPrivadaCreateInput, 'id' | 'createdAt' | 'updatedAt' | 'ordenCompraPrivada'>[] }
): Promise<OrdenCompraPrivada> => {
  const { pagos, ...ordenData } = data;
  const orden = await prisma.ordenCompraPrivada.create({ data: ordenData });
  if (pagos && Array.isArray(pagos) && pagos.length > 0) {
    for (const pago of pagos) {
      await prisma.pagoOrdenCompraPrivada.create({
        data: {
          ...pago,
          ordenCompraPrivada: { connect: { id: orden.id } }
        }
      });
    }
  }
  return orden;
};