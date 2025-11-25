import { Transporte } from '../../../prisma/generated/client';
import prisma from '../../database/prisma';
import { createBankAccount, updateBankAccount, deleteBankAccount, getBankAccountsByReference } from '../bankAccount/bankAccount.service';
import { CuentaBancariaTipo } from '../../../prisma/generated/client';


type CreateTransportData = Omit<Transporte, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateTransportData = Partial<CreateTransportData>;

export const getAllTransports = async () => {
  const transportes = await prisma.transporte.findMany({
    include: {
      cuentasBancarias: true,
      saldosTransporte: {
        where: {
          activo: true
        }
      },
    },
  });

  return transportes.map(transporte => {
    const saldoFavor = transporte.saldosTransporte
      .filter(s => s.tipoMovimiento === 'A_FAVOR')
      .reduce((sum, s) => sum + Number(s.monto), 0);

    const saldoDeuda = transporte.saldosTransporte
      .filter(s => s.tipoMovimiento === 'DEBE')
      .reduce((sum, s) => sum + Number(s.monto), 0);

    const saldo = saldoFavor - saldoDeuda;

    return {
      ...transporte,
      saldo
    };
  });
};

// Versión optimizada con cálculo de saldo
export const getAllTransportsWithSaldo = async () => {
  const transportes = await prisma.transporte.findMany({
    select: {
      id: true,
      razonSocial: true,
      ruc: true,
      direccion: true,
      telefono: true,
      email: true,
      estado: true,
      cobertura: true,
      departamento: true,
      provincia: true,
      distrito: true,
      createdAt: true,
      updatedAt: true,
      cuentasBancarias: true,
      saldosTransporte: {
        select: {
          tipoMovimiento: true,
          monto: true
        },
        where: {
          activo: true
        }
      }
    }
  });

  return transportes.map(transporte => {
    const saldoFavor = transporte.saldosTransporte
      .filter(s => s.tipoMovimiento === 'A_FAVOR')
      .reduce((sum, s) => sum + Number(s.monto), 0);

    const saldoDeuda = transporte.saldosTransporte
      .filter(s => s.tipoMovimiento === 'DEBE')
      .reduce((sum, s) => sum + Number(s.monto), 0);

    const saldo = saldoFavor - saldoDeuda;

    const { saldosTransporte, ...transporteData } = transporte;
    
    return {
      ...transporteData,
      saldo
    };
  });
};

// Versión usando SQL raw para máximo rendimiento
export const getAllTransportsWithSaldoRaw = async () => {
  return await prisma.$queryRaw`
    SELECT 
      t.*,
      COALESCE(
        SUM(CASE WHEN st.tipo_movimiento = 'A_FAVOR' THEN st.monto ELSE 0 END) - 
        SUM(CASE WHEN st.tipo_movimiento = 'DEBE' THEN st.monto ELSE 0 END), 
        0
      ) as saldo
    FROM transportes t
    LEFT JOIN saldos_transporte st ON t.id = st."transporteId" AND st.activo = true
    GROUP BY t.id
    ORDER BY t.id
  `;
};

export const getTransportById = (id: number): Promise<Transporte | null> => {
  return prisma.transporte.findUnique({
    where: { id },
    include: {
      cuentasBancarias: true,
    },
  });
};

export const createTransport = async (data: any): Promise<Transporte> => {
  const { cuentasBancarias, ...transportData } = data;

  const mappedData = {
    ruc: transportData.ruc,
    razonSocial: transportData.razon_social ?? transportData.razonSocial,
    direccion: transportData.direccion,
    telefono: transportData.telefono,
    email: transportData.email,
    estado: transportData.estado,
    cobertura: transportData.cobertura,
    departamento: transportData.departamento,
    provincia: transportData.provincia,
    distrito: transportData.distrito,
  };

  const transport = await prisma.transporte.create({ data: mappedData });

  // Crear cuentas bancarias si se proporcionaron
  if (cuentasBancarias && Array.isArray(cuentasBancarias) && cuentasBancarias.length > 0) {
    for (const cuenta of cuentasBancarias) {
      if (cuenta.banco || cuenta.numeroCuenta || cuenta.cci || cuenta.titularCuenta) {
        await createBankAccount({
          referenciaId: transport.id,
          tipoCuenta: CuentaBancariaTipo.TRANSPORTE,
          banco: cuenta.banco || '',
          numeroCuenta: cuenta.numeroCuenta || '',
          numeroCci: cuenta.cci || null,
          moneda: 'SOLES', // Default a SOLES, se puede hacer configurable después
          activa: true,
        });
      }
    }
  }

  // Retornar el transporte con las cuentas bancarias incluidas
  return getTransportById(transport.id) as Promise<Transporte>;
};

export const updateTransport = async (id: number, data: any): Promise<Transporte> => {
  const { cuentasBancarias, ...transportData } = data;

  // Mapeo explícito de snake_case a camelCase para Prisma
  const mappedData = {
    ...(transportData.ruc && { ruc: transportData.ruc }),
    ...(transportData.razon_social && { razonSocial: transportData.razon_social }),
    ...(transportData.razonSocial && { razonSocial: transportData.razonSocial }),
    ...(transportData.direccion && { direccion: transportData.direccion }),
    ...(transportData.telefono !== undefined && { telefono: transportData.telefono }),
    ...(transportData.email !== undefined && { email: transportData.email }),
    ...(transportData.estado !== undefined && { estado: transportData.estado }),
    ...(transportData.cobertura && { cobertura: transportData.cobertura }),
    ...(transportData.departamento && { departamento: transportData.departamento }),
    ...(transportData.provincia && { provincia: transportData.provincia }),
    ...(transportData.distrito && { distrito: transportData.distrito }),
  };

  // Actualizar el transporte
  await prisma.transporte.update({
    where: { id },
    data: mappedData,
  });

  // Manejar cuentas bancarias si se proporcionaron
  if (cuentasBancarias && Array.isArray(cuentasBancarias)) {
    // Obtener cuentas bancarias existentes
    const existingAccounts = await getBankAccountsByReference(CuentaBancariaTipo.TRANSPORTE, id);

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
          tipoCuenta: CuentaBancariaTipo.TRANSPORTE,
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

  // Retornar el transporte actualizado con las cuentas bancarias
  return getTransportById(id) as Promise<Transporte>;
};

export const deleteTransport = async (id: number): Promise<Transporte> => {
  // Obtener y eliminar cuentas bancarias asociadas
  const existingAccounts = await getBankAccountsByReference(CuentaBancariaTipo.TRANSPORTE, id);
  for (const account of existingAccounts) {
    await deleteBankAccount(account.id);
  }

  // Eliminar el transporte
  return prisma.transporte.delete({
    where: { id },
  });
};
