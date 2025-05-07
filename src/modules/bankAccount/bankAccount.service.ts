import { CuentaBancaria, Prisma, CuentaBancariaTipo } from '../../../generated/prisma';
import prisma from '../../database/prisma';
import logger from '../../shared/config/logger';

type BaseBankAccountData = Omit<CuentaBancaria, 'id' | 'createdAt' | 'updatedAt' | 'clienteId' | 'proveedorId' | 'transporteId' | 'empresaId'>;

export type CreateBankAccountData = BaseBankAccountData & {
  referenciaId: number;
  tipoCuenta: CuentaBancariaTipo; // CLIENTE, PROVEEDOR, TRANSPORTE, EMPRESA
};

export type UpdateBankAccountData = Partial<CreateBankAccountData>;

const buildRelationData = (tipo: CuentaBancariaTipo, referenciaId: number): { clienteId?: number; proveedorId?: number; transporteId?: number; empresaId?: number } => {
  switch (tipo) {
    case CuentaBancariaTipo.CLIENTE:
      return { clienteId: referenciaId };
    case CuentaBancariaTipo.PROVEEDOR:
      return { proveedorId: referenciaId };
    case CuentaBancariaTipo.TRANSPORTE:
      return { transporteId: referenciaId };
    case CuentaBancariaTipo.EMPRESA:
      return { empresaId: referenciaId };
    default:
      logger.error(`Tipo de cuenta bancaria desconocido: ${tipo}`);
      throw new Error('Tipo de cuenta bancaria inválido');
  }
};

export const getAllBankAccounts = (filters: { tipo?: CuentaBancariaTipo; referenciaId?: number } = {}): Promise<CuentaBancaria[]> => {
  const where: Prisma.CuentaBancariaWhereInput = {};
  if (filters.tipo) {
    switch (filters.tipo) {
      case CuentaBancariaTipo.CLIENTE: where.clienteId = filters.referenciaId; break;
      case CuentaBancariaTipo.PROVEEDOR: where.proveedorId = filters.referenciaId; break;
      case CuentaBancariaTipo.TRANSPORTE: where.transporteId = filters.referenciaId; break;
      case CuentaBancariaTipo.EMPRESA: where.empresaId = filters.referenciaId; break;
    }
  }
  return prisma.cuentaBancaria.findMany({ where });
};

export const getBankAccountById = (id: number): Promise<CuentaBancaria | null> => {
  return prisma.cuentaBancaria.findUnique({
    where: { id },
  });
};

export const getBankAccountsByReference = (tipo: CuentaBancariaTipo, referenciaId: number): Promise<CuentaBancaria[]> => {
  const relationFilter = buildRelationData(tipo, referenciaId);
  return prisma.cuentaBancaria.findMany({
    where: { ...relationFilter, tipoCuenta: tipo },
  });
};


export const createBankAccount = (data: CreateBankAccountData): Promise<CuentaBancaria> => {
  const { tipoCuenta, referenciaId, ...restData } = data;
  const relationData = buildRelationData(tipoCuenta, referenciaId);

  return prisma.cuentaBancaria.create({
    data: {
      ...restData,
      tipoCuenta,
      referenciaId,
      ...relationData,
    },
  });
};

export const updateBankAccount = async (id: number, data: UpdateBankAccountData): Promise<CuentaBancaria> => {
  const { tipoCuenta: newTipo, referenciaId: newReferenciaId, ...restData } = data;
  let finalData: Prisma.CuentaBancariaUpdateInput = { ...restData };

  if (newTipo !== undefined || newReferenciaId !== undefined) {
    const currentAccount = await prisma.cuentaBancaria.findUnique({
      where: { id },
      select: { tipoCuenta: true, referenciaId: true },
    });

    if (!currentAccount) {
      throw new Error('Cuenta bancaria no encontrada para actualizar.');
    }

    const finalTipo = newTipo !== undefined ? newTipo : currentAccount.tipoCuenta;
    const finalReferenciaId = newReferenciaId !== undefined ? newReferenciaId : currentAccount.referenciaId;

    if (!Object.values(CuentaBancariaTipo).includes(finalTipo)) {
      throw new Error(`Tipo de cuenta bancaria inválido: ${finalTipo}`);
    }

    const relationData = buildRelationData(finalTipo, finalReferenciaId);

    finalData = {
      ...finalData,
      tipoCuenta: finalTipo,
      referenciaId: finalReferenciaId,
      clienteId: null,
      proveedorId: null,
      transporteId: null,
      empresaId: null,
      ...relationData,
    };
  } else {
    finalData = { ...restData };
  }

  return prisma.cuentaBancaria.update({
    where: { id },
    data: finalData,
  });
};

export const deleteBankAccount = (id: number): Promise<CuentaBancaria> => {
  return prisma.cuentaBancaria.delete({
    where: { id },
  });
};
