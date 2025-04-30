import prisma from '../../database/prisma';
import { OrdenCompra, Empresa } from '@prisma/client';
import { CreateOrdenCompraData, UpdateOrdenCompraData } from './orden-compra.types';
import { customAlphabet } from 'nanoid'; // Para generar códigos únicos más robustos

// Configuración para generar códigos únicos (ej. OC-ABC-123)
// Ajusta el alfabeto y tamaño según necesites
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

export const getAllOrdenesCompra = (): Promise<OrdenCompra[]> => {
  return prisma.ordenCompra.findMany({
    include: {
      empresa: { select: { id: true, razonSocial: true, ruc: true } }, // Seleccionar campos específicos
      cliente: true, // Incluir todos los campos de cliente
      catalogoEmpresa: { select: { id: true, nombre: true } }, // Asumiendo que 'nombre' es relevante, no 'codigo'
      contactoCliente: { select: { id: true, nombre: true, telefono: true, cargo: true, email: true } }, // Corregido email vs correo
    },
    orderBy: {
      id: 'desc', // Ordenar por ID descendente como en el ejemplo PHP
    },
  });
};

export const getOrdenCompraById = (id: number): Promise<OrdenCompra | null> => {
  return prisma.ordenCompra.findUnique({
    where: { id },
    include: {
      empresa: true,
      cliente: true,
      contactoCliente: true,
      ordenCompraPrivada: {
        include: {
          pagos: true,
          cliente: true, // Ya incluido en la relación directa?
          contactoCliente: true, // Ya incluido en la relación directa?
        },
      },
      catalogoEmpresa: true,
      // Incluir otras relaciones si son necesarias (facturaciones, gestionCobranzas, etc.)
      facturaciones: true,
      gestionCobranzas: true,
      ordenesProveedor: true,
    },
    // No es necesario select si incluyes relaciones, a menos que quieras excluir campos específicos
  });
};

export const createOrdenCompra = async (data: CreateOrdenCompraData): Promise<OrdenCompra> => {
  // Validación de campos requeridos (se hará mejor con Zod en la capa feature)
  if (!data.codigoVenta || !data.empresaId || !data.clienteId) {
    throw new Error('Faltan campos requeridos para crear la orden de compra.');
  }

  // Asegurarse que productos sea un Json válido si se proporciona
  if (data.productos && typeof data.productos !== 'object') {
    try {
      data.productos = JSON.parse(data.productos as unknown as string);
    } catch (e) {
      throw new Error('El campo productos debe ser un JSON válido.');
    }
  }

  // Convertir fechas si vienen como string
  if (data.fechaEmision && typeof data.fechaEmision === 'string') {
    data.fechaEmision = new Date(data.fechaEmision);
  }
  if (data.fechaEntrega && typeof data.fechaEntrega === 'string') {
    data.fechaEntrega = new Date(data.fechaEntrega);
  }
  // ... convertir otras fechas si es necesario

  return prisma.ordenCompra.create({ data: data as any }); // Usar 'as any' temporalmente si hay problemas de tipo con Json o Decimal
};

export const updateOrdenCompra = (id: number, data: UpdateOrdenCompraData): Promise<OrdenCompra> => {
  // Convertir fechas si vienen como string
  if (data.fechaEmision && typeof data.fechaEmision === 'string') {
    data.fechaEmision = new Date(data.fechaEmision);
  }
  if (data.fechaEntrega && typeof data.fechaEntrega === 'string') {
    data.fechaEntrega = new Date(data.fechaEntrega);
  }
  // ... convertir otras fechas

  // Asegurarse que productos sea un Json válido si se proporciona
  if (data.productos && typeof data.productos !== 'object') {
    try {
      data.productos = JSON.parse(data.productos as unknown as string);
    } catch (e) {
      throw new Error('El campo productos debe ser un JSON válido.');
    }
  }

  return prisma.ordenCompra.update({
    where: { id },
    data: data as any, // Usar 'as any' temporalmente
  });
};

export const deleteOrdenCompra = (id: number): Promise<OrdenCompra> => {
  // Considerar lógica de borrado suave si es necesario
  return prisma.ordenCompra.delete({
    where: { id },
  });
};

/**
 * Genera un código único para una nueva Orden de Compra basado en la empresa.
 * Ejemplo: OC-MUL-124
 * @param empresaId - ID de la empresa.
 * @returns Código único generado.
 */
export const generateUniqueOrdenCompraCode = async (empresaId: number): Promise<string> => {
  const empresa = await prisma.empresa.findUnique({
    where: { id: empresaId },
    select: { razonSocial: true },
  });

  if (!empresa) {
    throw new Error('Empresa no encontrada para generar código de OC.');
  }

  const prefix = `OC-${empresa.razonSocial.substring(0, 3).toUpperCase()}-`;

  // Intenta generar un código único basado en contador o nanoid
  // Opción 1: Basado en contador (similar a PHP, puede tener concurrencia)
  // const count = await prisma.ordenCompra.count({ where: { empresaId } });
  // let nextCode = `${prefix}${count + 1}`;

  // Opción 2: Usando nanoid para mayor unicidad (menos predecible)
  let nextCode = `${prefix}${nanoid()}`;
  let attempts = 0;
  const maxAttempts = 5;

  // Verificar si el código ya existe y reintentar si es necesario
  while (attempts < maxAttempts) {
    const existing = await prisma.ordenCompra.findUnique({
      where: { codigoVenta: nextCode },
      select: { id: true },
    });
    if (!existing) {
      return nextCode; // Código único encontrado
    }
    // Generar nuevo código si hubo colisión
    nextCode = `${prefix}${nanoid()}`;
    attempts++;
  }

  throw new Error('No se pudo generar un código de venta único después de varios intentos.');
};
