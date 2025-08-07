import { OrdenProveedor, Prisma } from '@prisma/client';
import prisma from '../../database/prisma';

type CreateOrdenProveedorData = Omit<OrdenProveedor, 'id' | 'createdAt' | 'updatedAt'> & {
  productos?: Prisma.OpProductoCreateNestedManyWithoutOrdenProveedorInput;
  transportesAsignados?: Prisma.TransporteAsignadoCreateNestedManyWithoutOrdenProveedorInput;
  pagos?: Prisma.PagoOrdenProveedorCreateNestedManyWithoutOrdenProveedorInput;
};

type UpdateOrdenProveedorData = Partial<Omit<OrdenProveedor, 'id' | 'createdAt' | 'updatedAt'>> & {
  productos?: Prisma.OpProductoUpdateManyWithoutOrdenProveedorNestedInput;
  transportesAsignados?: Prisma.TransporteAsignadoUpdateManyWithoutOrdenProveedorNestedInput;
  pagos?: Prisma.PagoOrdenProveedorUpdateManyWithoutOrdenProveedorNestedInput;
};

// Función auxiliar para procesar datos (fechas, Decimal)
const processOrdenProveedorData = (data: any) => {
  if (data.fechaDespacho && typeof data.fechaDespacho === 'string') {
    data.fechaDespacho = new Date(data.fechaDespacho);
  }
  if (data.fechaProgramada && typeof data.fechaProgramada === 'string') {
    data.fechaProgramada = new Date(data.fechaProgramada);
  }
  if (data.fechaRecepcion && typeof data.fechaRecepcion === 'string') {
    data.fechaRecepcion = new Date(data.fechaRecepcion);
  }
  // No convertir fechaEntrega si es string por definición en schema

  if (data.totalProveedor && typeof data.totalProveedor !== 'object') {
    data.totalProveedor = new Prisma.Decimal(data.totalProveedor);
  }

  return data;
};

const generateCodigoOp = async (id: number): Promise<string> => {
  const oc = await prisma.ordenCompra.findUnique({
    where: { id },
    select: { 
      codigoVenta: true,
      empresa: {
        select: {
          razonSocial: true
        }
      }
    },
  });

  if (!oc) throw new Error('Orden de compra no encontrada');
  if (!oc.empresa) throw new Error('La orden de compra no tiene empresa asociada');

  // ✅ CORRECCIÓN: Manejar el formato real del sistema OC-2025-001, OCP-2025-001, etc.
  // Extraer las 3 primeras letras de la razón social de la empresa
  const empresaPrefix = oc.empresa.razonSocial
    .replace(/\s+/g, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .substring(0, 3);

  // ✅ CORRECCIÓN: Buscar OPs existentes con el patrón OP[EMP][ID]-
  const basePattern = `OP${empresaPrefix}${id}-`;
  
  const existingOps = await prisma.ordenProveedor.findMany({
    where: {
      codigoOp: {
        startsWith: basePattern,
      },
    },
    select: { codigoOp: true },
  });

  // ✅ CORRECCIÓN: Extraer el número secuencial correctamente
  let maxSuffix = 0;
  for (const op of existingOps) {
    const opMatch = op.codigoOp.match(new RegExp(`^${basePattern}(\\d+)$`));
    if (opMatch) {
      const num = parseInt(opMatch[1], 10);
      if (num > maxSuffix) maxSuffix = num;
    }
  }

  // ✅ RESULTADO: OPMUL1-1, OPMUL1-2, OPMUL2-1, etc.
  const newSuffix = maxSuffix + 1;
  return `${basePattern}${newSuffix}`;
};

const generateCodigoTransporte = async (ordenProveedorId: number): Promise<string> => {
  // ✅ NUEVO: Obtener el código de la OP para construir el código de transporte
  const ordenProveedor = await prisma.ordenProveedor.findUnique({
    where: { id: ordenProveedorId },
    select: { codigoOp: true },
  });

  if (!ordenProveedor) {
    throw new Error('Orden de proveedor no encontrada');
  }

  const codigoOp = ordenProveedor.codigoOp;
  
  // ✅ NUEVO: Buscar transportes existentes para esta OP con el patrón [CODIGO_OP]-T[N]
  const existing = await prisma.transporteAsignado.findMany({
    where: { ordenProveedorId: ordenProveedorId },
    select: { codigoTransporte: true },
  });
  
  let maxSuffix = 0;
  for (const t of existing) {
    // ✅ NUEVO: Buscar patrón [CODIGO_OP]-T[NUMERO]
    const match = t.codigoTransporte.match(new RegExp(`^${codigoOp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-T(\\d+)$`));
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxSuffix) maxSuffix = num;
    }
  }
  
  // ✅ RESULTADO: OPMUL4-1-T1, OPMUL4-1-T2, OPMUL4-1-T3, etc.
  const newSuffix = maxSuffix + 1;
  return `${codigoOp}-T${newSuffix}`;
};

export const getOrdenesProveedorByOrdenCompraId = async (ordenCompraId: number): Promise<OrdenProveedor[]> => {
  return prisma.ordenProveedor.findMany({
    where: {
      ordenCompraId,
      activo: true,
    },
    include: {
      empresa: true,
      proveedor: true,
      contactoProveedor: true,
      ordenCompra: true,
      productos: true,
      pagos: true,
      transportesAsignados: { include: { transporte: true, contactoTransporte: true, pagos: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getCodigosOrdenesProveedor = (ordenCompraId: number): Promise<Array<Pick<OrdenProveedor, 'codigoOp' | 'id' | 'createdAt' | 'updatedAt'>>> => {
  return prisma.ordenProveedor.findMany({
    where: {
      ordenCompraId,
      activo: true,
    },
    select: { codigoOp: true, id: true, createdAt: true, updatedAt: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const getAllOrdenesProveedor = (): Promise<OrdenProveedor[]> => {
  return prisma.ordenProveedor.findMany({
    where: { activo: true },
    include: {
      empresa: true,
      proveedor: true,
      contactoProveedor: true,
      ordenCompra: true,
      productos: true,
      pagos: true,
      transportesAsignados: { include: { transporte: true, contactoTransporte: true, pagos: true } },
    },
    orderBy: { createdAt: 'desc' }, // Ordenamiento descendente por fecha de creación
  });
};

export const getOrdenProveedorById = (id: number): Promise<OrdenProveedor | null> => {
  return prisma.ordenProveedor.findFirst({
    where: {
      id,
      activo: true,
    },
    include: {
      empresa: true,
      proveedor: true,
      contactoProveedor: true,
      ordenCompra: {
        include: {
          cliente: true,
          contactoCliente: true,
        },
      },
      productos: true,
      pagos: true,
      transportesAsignados: { include: { transporte: true, contactoTransporte: true, pagos: true } },
    },
  });
};

export const createOrdenProveedor = async (id: number, data: CreateOrdenProveedorData): Promise<OrdenProveedor> => {
  const codigoOp = await generateCodigoOp(id);
  const processedData = processOrdenProveedorData({ ...data, codigoOp });
  
  // ✅ CORRECCIÓN: Generar códigos únicos para cada transporte
  if (processedData.transportesAsignados && Array.isArray(processedData.transportesAsignados.create)) {
    // Obtener el número máximo actual de transportes para esta OP
    const existing = await prisma.transporteAsignado.findMany({
      where: { ordenProveedorId: id },
      select: { codigoTransporte: true },
    });
    
    let currentMaxSuffix = 0;
    for (const t of existing) {
      const match = t.codigoTransporte.match(new RegExp(`^${codigoOp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-T(\\d+)$`));
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > currentMaxSuffix) currentMaxSuffix = num;
      }
    }
    
    // Asignar códigos secuenciales únicos
    for (let i = 0; i < processedData.transportesAsignados.create.length; i++) {
      const newSuffix = currentMaxSuffix + i + 1;
      processedData.transportesAsignados.create[i].codigoTransporte = `${codigoOp}-T${newSuffix}`;
    }
  }
  
  return prisma.ordenProveedor.create({
    data: processedData as CreateOrdenProveedorData,
    include: {
      productos: true,
      pagos: true,
      transportesAsignados: true,
    },
  });
};

export const updateOrdenProveedor = async (id: number, data: UpdateOrdenProveedorData): Promise<OrdenProveedor> => {
  const existing = await prisma.ordenProveedor.findFirst({
    where: { id, activo: true },
    include: {
      transportesAsignados: true // ✅ Incluir transportes existentes
    }
  });

  if (!existing) {
    throw new Error('NOT_FOUND');
  }

  const processedData = processOrdenProveedorData(data);
  
  // ✅ NUEVA LÓGICA: Solo generar códigos para transportes REALMENTE NUEVOS
  if (processedData.transportesAsignados) {
    const codigoOp = existing.codigoOp;
    
    // Si hay operaciones de creación (transportes realmente nuevos)
    if (processedData.transportesAsignados.create && Array.isArray(processedData.transportesAsignados.create)) {
      // Obtener todos los transportes existentes (incluye los que se van a mantener)
      const allExistingTransports = await prisma.transporteAsignado.findMany({
        where: { ordenProveedorId: id },
        select: { codigoTransporte: true },
      });
      
      let currentMaxSuffix = 0;
      for (const t of allExistingTransports) {
        const match = t.codigoTransporte.match(new RegExp(`^${codigoOp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-T(\\d+)$`));
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > currentMaxSuffix) currentMaxSuffix = num;
        }
      }
      
      // ✅ SOLO generar códigos para los NUEVOS transportes
      for (let i = 0; i < processedData.transportesAsignados.create.length; i++) {
        // Verificar si realmente es nuevo (no tiene codigoTransporte)
        if (!processedData.transportesAsignados.create[i].codigoTransporte) {
          const newSuffix = currentMaxSuffix + i + 1;
          processedData.transportesAsignados.create[i].codigoTransporte = `${codigoOp}-T${newSuffix}`;
        }
      }
    }
  }
  
  return prisma.ordenProveedor.update({
    where: { id },
    data: processedData as any,
    include: {
      productos: true,
      pagos: true,
      transportesAsignados: { include: { transporte: true, contactoTransporte: true, pagos: true } },
    },
  });
};

export const patchOrdenProveedor = async (id: number, data: Partial<UpdateOrdenProveedorData>): Promise<OrdenProveedor> => {
  const existing = await prisma.ordenProveedor.findFirst({
    where: { id, activo: true },
  });

  if (!existing) {
    throw new Error('NOT_FOUND');
  }

  const processedData = processOrdenProveedorData(data);
  
  return prisma.ordenProveedor.update({
    where: { id },
    data: processedData as any,
    include: {
      productos: true,
      pagos: true,
      transportesAsignados: { include: { transporte: true, contactoTransporte: true, pagos: true } },
    },
  });
};
