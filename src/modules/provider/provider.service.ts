import { Proveedor } from '@prisma/client';
import prisma from '../../database/prisma';
import { createBankAccount, updateBankAccount, deleteBankAccount, getBankAccountsByReference } from '../bankAccount/bankAccount.service';
import { CuentaBancariaTipo } from '@prisma/client';

// Cambiar la importación para usar el alias @prisma/client

// import { Proveedor } = from '@prisma/client'; // Comentar o eliminar la línea anterior

type CreateProviderData = Omit<Proveedor, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateProviderData = Partial<CreateProviderData>;

export const getAllProviders = (): Promise<Proveedor[]> => {
  return prisma.proveedor.findMany({
    include: {
      cuentasBancarias: true,
    },
  });
};

export const getProviderById = (id: number): Promise<Proveedor | null> => {
  return prisma.proveedor.findUnique({
    where: { id },
    include: {
      cuentasBancarias: true,
    },
  });
};

export const createProvider = async (data: any): Promise<Proveedor> => {
  const { cuentasBancarias, ...providerData } = data;

  const mappedData = {
    ruc: providerData.ruc,
    razonSocial: providerData.razon_social ?? providerData.razonSocial,
    direccion: providerData.direccion,
    telefono: providerData.telefono,
    email: providerData.email,
    estado: providerData.estado,
    departamento: providerData.departamento,
    provincia: providerData.provincia,
    distrito: providerData.distrito,
  };

  const provider = await prisma.proveedor.create({ data: mappedData });

  // Crear cuentas bancarias si se proporcionaron
  if (cuentasBancarias && Array.isArray(cuentasBancarias) && cuentasBancarias.length > 0) {
    for (const cuenta of cuentasBancarias) {
      if (cuenta.banco || cuenta.numeroCuenta || cuenta.cci || cuenta.titularCuenta) {
        await createBankAccount({
          referenciaId: provider.id,
          tipoCuenta: CuentaBancariaTipo.PROVEEDOR,
          banco: cuenta.banco || '',
          numeroCuenta: cuenta.numeroCuenta || '',
          numeroCci: cuenta.cci || null,
          moneda: 'SOLES', // Default a SOLES, se puede hacer configurable después
          activa: true,
        });
      }
    }
  }

  // Retornar el proveedor con las cuentas bancarias incluidas
  return getProviderById(provider.id) as Promise<Proveedor>;
};

export const updateProvider = async (id: number, data: any): Promise<Proveedor> => {
  const { cuentasBancarias, ...providerData } = data;

  // Mapeo explícito de snake_case a camelCase para Prisma
  const mappedData = {
    ...(providerData.ruc && { ruc: providerData.ruc }),
    ...(providerData.razon_social && { razonSocial: providerData.razon_social }),
    ...(providerData.razonSocial && { razonSocial: providerData.razonSocial }),
    ...(providerData.direccion && { direccion: providerData.direccion }),
    ...(providerData.telefono !== undefined && { telefono: providerData.telefono }),
    ...(providerData.email !== undefined && { email: providerData.email }),
    ...(providerData.estado !== undefined && { estado: providerData.estado }),
    ...(providerData.departamento && { departamento: providerData.departamento }),
    ...(providerData.provincia && { provincia: providerData.provincia }),
    ...(providerData.distrito && { distrito: providerData.distrito }),
  };

  // Actualizar el proveedor
  await prisma.proveedor.update({
    where: { id },
    data: mappedData,
  });

  // Manejar cuentas bancarias si se proporcionaron
  if (cuentasBancarias && Array.isArray(cuentasBancarias)) {
    // Obtener cuentas bancarias existentes
    const existingAccounts = await getBankAccountsByReference(CuentaBancariaTipo.PROVEEDOR, id);

    // Filtrar cuentas bancarias válidas (que tengan al menos un campo completado)
    const validAccounts = cuentasBancarias.filter((cuenta: any) =>
      cuenta.banco || cuenta.numeroCuenta || cuenta.cci || cuenta.titularCuenta
    );

    // Crear mapa de cuentas existentes por ID (si tienen ID) o por contenido
    const existingMap = new Map();
    existingAccounts.forEach(account => {
      existingMap.set(account.id, account);
    });

    // Procesar cada cuenta bancaria del frontend
    for (let i = 0; i < validAccounts.length; i++) {
      const cuenta = validAccounts[i];

      if (cuenta.id && existingMap.has(cuenta.id)) {
        // Actualizar cuenta existente
        await updateBankAccount(cuenta.id, {
          banco: cuenta.banco || '',
          numeroCuenta: cuenta.numeroCuenta || '',
          numeroCci: cuenta.cci || null,
          moneda: 'SOLES',
          activa: true,
        });
        existingMap.delete(cuenta.id); // Remover del mapa para no eliminarla después
      } else {
        // Crear nueva cuenta
        await createBankAccount({
          referenciaId: id,
          tipoCuenta: CuentaBancariaTipo.PROVEEDOR,
          banco: cuenta.banco || '',
          numeroCuenta: cuenta.numeroCuenta || '',
          numeroCci: cuenta.cci || null,
          moneda: 'SOLES',
          activa: true,
        });
      }
    }

    // Eliminar cuentas que ya no están en el frontend
    for (const [accountId] of existingMap) {
      await deleteBankAccount(accountId);
    }
  }

  // Retornar el proveedor actualizado con las cuentas bancarias
  return getProviderById(id) as Promise<Proveedor>;
};

export const deleteProvider = async (id: number): Promise<Proveedor> => {
  // Obtener y eliminar cuentas bancarias asociadas
  const existingAccounts = await getBankAccountsByReference(CuentaBancariaTipo.PROVEEDOR, id);
  for (const account of existingAccounts) {
    await deleteBankAccount(account.id);
  }

  // Eliminar el proveedor
  return prisma.proveedor.delete({
    where: { id },
  });
};
