import { Cotizacion, Prisma } from '@prisma/client';
import prisma from '../../database/prisma';

// Asumiendo que CotizacionProducto se maneja aquí o se pasa como data anidada
type CreateCotizacionData = Omit<Cotizacion, 'id' | 'createdAt' | 'updatedAt' | 'codigoCotizacion'> & {
  codigoCotizacion?: string; // Opcional porque se genera automáticamente
  productos?: any[]; // Array simple de productos para crear
};
type UpdateCotizacionData = Partial<Omit<Cotizacion, 'id' | 'createdAt' | 'updatedAt'>> & {
  productos?: any[] // Array simple de productos para actualizar
};


export const getAllCotizaciones = (): Promise<Cotizacion[]> => {
  return prisma.cotizacion.findMany({
    include: {
      cliente: true,
      empresa: true,
      contactoCliente: true,
      productos: true, // Incluir productos relacionados
    },
  });
};

export const getCotizacionById = (id: number): Promise<Cotizacion | null> => {
  return prisma.cotizacion.findUnique({
    where: { id },
    include: {
      cliente: true,
      empresa: true,
      contactoCliente: true,
      productos: true,
    },
  });
};

export const createCotizacion = async (data: CreateCotizacionData): Promise<Cotizacion> => {
  // Generar código de cotización automáticamente
  const codigoCotizacion = await generateCodigoCotizacion(data.empresaId);

  // Validaciones básicas (sin codigoCotizacion ya que se genera automáticamente)
  if (!data.empresaId || !data.clienteId || !data.montoTotal || !data.tipoPago) {
    throw new Error('Faltan campos requeridos para crear la cotización.');
  }

  // Crear la cotización primero
  const cotizacion = await prisma.cotizacion.create({
    data: {
      codigoCotizacion,
      empresaId: data.empresaId,
      clienteId: data.clienteId,
      contactoClienteId: data.contactoClienteId,
      montoTotal: data.montoTotal,
      tipoPago: data.tipoPago,
      notaPago: data.notaPago,
      notaPedido: data.notaPedido,
      direccionEntrega: data.direccionEntrega,
      distritoEntrega: data.distritoEntrega,
      provinciaEntrega: data.provinciaEntrega,
      departamentoEntrega: data.departamentoEntrega,
      referenciaEntrega: data.referenciaEntrega,
      fechaCotizacion: data.fechaCotizacion,
      fechaEntrega: data.fechaEntrega,
    },
  });

  // Si hay productos, crearlos por separado
  if (data.productos && Array.isArray(data.productos) && data.productos.length > 0) {
    const productosData = data.productos.map((producto: any) => ({
      codigo: producto.codigo,
      descripcion: producto.descripcion,
      unidadMedida: producto.unidadMedida,
      cantidad: producto.cantidad,
      cantidadAlmacen: producto.cantidadAlmacen,
      cantidadTotal: producto.cantidadTotal,
      precioUnitario: producto.precioUnitario,
      total: producto.total,
      cotizacionId: cotizacion.id,
    }));

    await prisma.cotizacionProducto.createMany({
      data: productosData,
    });
  }

  // Retornar la cotización con productos
  return prisma.cotizacion.findUnique({
    where: { id: cotizacion.id },
    include: {
      productos: true,
    },
  }) as Promise<Cotizacion>;
};

const generateCodigoCotizacion = async (empresaId: number): Promise<string> => {
  try {
    // Obtener la empresa para extraer las 3 primeras letras
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      select: { razonSocial: true }
    });

    if (!empresa) {
      throw new Error('Empresa no encontrada');
    }

    // Extraer las 3 primeras letras de la razón social (sin espacios ni caracteres especiales)
    let tresLetras = empresa.razonSocial
      .replace(/[^a-zA-Z]/g, '') // Solo letras
      .substring(0, 3)
      .toUpperCase();

    // Si no hay suficientes letras, usar las disponibles o un fallback
    if (tresLetras.length < 3) {
      if (tresLetras.length === 0) {
        tresLetras = 'EMP'; // Fallback si no hay letras
      } else {
        // Completar con X si faltan letras
        tresLetras = tresLetras.padEnd(3, 'X');
      }
    }

    // Obtener el siguiente número secuencial usando count agrupado por empresa
    const cotizacionesCount = await prisma.cotizacion.count({
      where: {
        empresaId: empresaId
      }
    });

    // El siguiente número es el count + 1
    const siguienteNumero = cotizacionesCount + 1;

    // Formato: COT + 3 letras + número secuencial
    return `COT${tresLetras}${siguienteNumero}`;
  } catch (error) {
    console.error('Error generando código de cotización:', error);
    // Fallback: usar timestamp si hay error
    return `COT${Date.now()}`;
  }
};

export const updateCotizacion = async (id: number, data: UpdateCotizacionData): Promise<Cotizacion> => {
  // Extraer productos del data para manejarlos por separado
  const { productos, ...cotizacionData } = data;

  // Convertir fechas si vienen como string
  if (cotizacionData.fechaCotizacion && typeof cotizacionData.fechaCotizacion === 'string') {
    cotizacionData.fechaCotizacion = new Date(cotizacionData.fechaCotizacion);
  }
  if (cotizacionData.fechaEntrega && typeof cotizacionData.fechaEntrega === 'string') {
    cotizacionData.fechaEntrega = new Date(cotizacionData.fechaEntrega);
  }

  return prisma.$transaction(async (tx) => {
    // 1. Actualizar la cotización sin productos
    const updatedCotizacion = await tx.cotizacion.update({
      where: { id },
      data: cotizacionData as any,
    });

    // 2. Si hay productos, reemplazar todos los productos existentes
    if (productos && Array.isArray(productos) && productos.length > 0) {
      // Eliminar productos existentes
      await tx.cotizacionProducto.deleteMany({
        where: { cotizacionId: id }
      });

      // Crear nuevos productos
      const productosData = productos.map((producto: any) => ({
        codigo: producto.codigo,
        descripcion: producto.descripcion,
        unidadMedida: producto.unidadMedida,
        cantidad: producto.cantidad,
        cantidadAlmacen: producto.cantidadAlmacen,
        cantidadTotal: producto.cantidadTotal,
        precioUnitario: producto.precioUnitario,
        total: producto.total,
        cotizacionId: id,
      }));

      await tx.cotizacionProducto.createMany({
        data: productosData,
      });
    }

    // 3. Retornar la cotización actualizada con productos
    return tx.cotizacion.findUnique({
      where: { id },
      include: {
        productos: true,
        cliente: true,
        empresa: true,
        contactoCliente: true,
      },
    }) as Promise<Cotizacion>;
  });
};

export const deleteCotizacion = (id: number): Promise<Cotizacion> => {
  // Considerar borrado en cascada o manejo de productos relacionados si es necesario
  // Por defecto, Prisma podría requerir eliminar productos primero si no hay onDelete: Cascade
  // Opcionalmente, realizar la eliminación en una transacción
  return prisma.$transaction(async (tx) => {
    // 1. Eliminar productos relacionados (si es necesario y no hay cascada)
    await tx.cotizacionProducto.deleteMany({ where: { cotizacionId: id } });
    // 2. Eliminar la cotización
    const deletedCotizacion = await tx.cotizacion.delete({ where: { id } });
    return deletedCotizacion;
  });
  /* // Alternativa simple si hay onDelete: Cascade o no importa dejar productos huérfanos (revisar schema)
  return prisma.cotizacion.delete({
    where: { id },
  });
  */
};
