
import { Empresa } from '../../../prisma/generated/client';
import prisma from '../../database/prisma';
import { createBankAccount, updateBankAccount, deleteBankAccount, getBankAccountsByReference } from '../bankAccount/bankAccount.service';
import { CuentaBancariaTipo } from '../../../prisma/generated/client';

type CreateCompanyData = Omit<Empresa, 'id' | 'createdAt' | 'updatedAt'>;
// Incluir logoUrl como campo opcional en UpdateCompanyData
type UpdateCompanyData = Partial<CreateCompanyData & { logoUrl: string | null }>;

export const getAllCompanies = (): Promise<Empresa[]> => {
  return prisma.empresa.findMany({
    include: {
      catalogos: true,
      cuentasBancarias: true,
    },
  });
};

export const getCompanyById = (id: number): Promise<Empresa | null> => {
  return prisma.empresa.findUnique({
    where: { id },
    include: {
      catalogos: true,
      cuentasBancarias: true,
    },
  });
};

export const createCompany = async (data: any): Promise<Empresa> => {
  const { cuentasBancarias, ...companyData } = data;

  const mappedData = {
    ruc: companyData.ruc,
    razonSocial: companyData.razon_social ?? companyData.razonSocial,
    direccion: companyData.direccion,
    telefono: companyData.telefono,
    email: companyData.email,
    departamento: companyData.departamento,
    provincia: companyData.provincia,
    distrito: companyData.distrito,
    logo: companyData.logo,
    direcciones: companyData.direcciones,
    web: companyData.web,
  };

  const company = await prisma.empresa.create({ data: mappedData });

  // Crear cuentas bancarias si se proporcionaron
  if (cuentasBancarias && Array.isArray(cuentasBancarias) && cuentasBancarias.length > 0) {
    for (const cuenta of cuentasBancarias) {
      if (cuenta.banco || cuenta.numeroCuenta || cuenta.cci || cuenta.titularCuenta) {
        await createBankAccount({
          referenciaId: company.id,
          tipoCuenta: CuentaBancariaTipo.EMPRESA,
          banco: cuenta.banco || '',
          numeroCuenta: cuenta.numeroCuenta || '',
          numeroCci: cuenta.cci || null,
          moneda: 'SOLES',
          activa: true,
        });
      }
    }
  }

  // Retornar la empresa con las cuentas bancarias incluidas
  return getCompanyById(company.id) as Promise<Empresa>;
};

export const updateCompany = async (id: number, data: any): Promise<Empresa> => {
  const { cuentasBancarias, ...companyData } = data;

  const mappedData = {
    ruc: companyData.ruc,
    razonSocial: companyData.razon_social ?? companyData.razonSocial,
    direccion: companyData.direccion,
    telefono: companyData.telefono,
    email: companyData.email,
    departamento: companyData.departamento,
    provincia: companyData.provincia,
    distrito: companyData.distrito,
    logo: companyData.logo,
    direcciones: companyData.direcciones,
    web: companyData.web,
  };

  await prisma.empresa.update({
    where: { id },
    data: mappedData,
  });

  // Manejar cuentas bancarias si se proporcionaron
  if (cuentasBancarias && Array.isArray(cuentasBancarias)) {
    // Obtener cuentas bancarias existentes
    const existingAccounts = await getBankAccountsByReference(CuentaBancariaTipo.EMPRESA, id);

    // Filtrar cuentas bancarias válidas (que tengan al menos un campo completado)
    const validAccounts = cuentasBancarias.filter((cuenta: any) =>
      cuenta.banco || cuenta.numeroCuenta || cuenta.cci || cuenta.titularCuenta
    );

    // Crear mapa de cuentas existentes por ID
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
          tipoCuenta: CuentaBancariaTipo.EMPRESA,
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

  // Retornar la empresa actualizada con las cuentas bancarias
  return getCompanyById(id) as Promise<Empresa>;
};

export const deleteCompany = async (id: number): Promise<Empresa> => {
  // Obtener y eliminar cuentas bancarias asociadas
  const existingAccounts = await getBankAccountsByReference(CuentaBancariaTipo.EMPRESA, id);
  for (const account of existingAccounts) {
    await deleteBankAccount(account.id);
  }

  // Eliminar la empresa
  return prisma.empresa.delete({
    where: { id },
  });
};

