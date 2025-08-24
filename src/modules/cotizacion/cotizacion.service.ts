import { Cotizacion, Prisma } from '@prisma/client';
import prisma from '../../database/prisma';

// Asumiendo que CotizacionProducto se maneja aquí o se pasa como data anidada
type CreateCotizacionData = Omit<Cotizacion, 'id' | 'createdAt' | 'updatedAt' | 'codigoCotizacion'> & {
  codigoCotizacion?: string; // Opcional porque se genera automáticamente
  productos?: Prisma.CotizacionProductoCreateNestedManyWithoutCotizacionInput; // Para crear productos junto con la cotización
};
type UpdateCotizacionData = Partial<Omit<Cotizacion, 'id' | 'createdAt' | 'updatedAt'>> & {
   productos?: Prisma.CotizacionProductoUpdateManyWithoutCotizacionNestedInput // Para actualizar productos
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
  
  // Convertir fechas si vienen como string
  if (data.fechaCotizacion && typeof data.fechaCotizacion === 'string') {
    data.fechaCotizacion = new Date(data.fechaCotizacion);
  }
  if (data.fechaEntrega && typeof data.fechaEntrega === 'string') {
    data.fechaEntrega = new Date(data.fechaEntrega);
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

// Función para generar el código de cotización
// Formato: COT + 3 primeras letras de la empresa + número secuencial
// Ejemplos:
// - Empresa "MULTILIMP S.A.C." -> COTMUL1, COTMUL2, COTMUL3...
// - Empresa "ABC CORPORATION" -> COTABC1, COTABC2, COTABC3...
// - Empresa "123 COMPANY" -> COTCOM1, COTCOM2, COTCOM3... (solo letras)
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

export const updateCotizacion = (id: number, data: UpdateCotizacionData): Promise<Cotizacion> => {
  // Convertir fechas si vienen como string
  if (data.fechaCotizacion && typeof data.fechaCotizacion === 'string') {
    data.fechaCotizacion = new Date(data.fechaCotizacion);
  }
  if (data.fechaEntrega && typeof data.fechaEntrega === 'string') {
    data.fechaEntrega = new Date(data.fechaEntrega);
  }

  return prisma.cotizacion.update({
    where: { id },
    data: data as any, // Usar 'as any' si hay problemas con tipos anidados o Decimal
    include: {
      productos: true, // Devolver la cotización actualizada con sus productos
    },
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
