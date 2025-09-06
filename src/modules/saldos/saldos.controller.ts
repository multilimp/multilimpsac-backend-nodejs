import { Request, Response } from 'express';
import prisma from '../../database/prisma';
import { handleError } from '../../shared/middleware/handleError';

// Obtener información financiera de un proveedor
export const getProviderFinancialData = async (req: Request, res: Response) => {
    try {
        const providerId = parseInt(req.params.providerId, 10);

        if (isNaN(providerId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de proveedor inválido'
            });
        }

        // Obtener saldos del proveedor
        const saldos = await prisma.saldoProveedor.findMany({
            where: {
                proveedorId: providerId,
                activo: true
            },
            orderBy: {
                fecha: 'desc'
            }
        });

        // Obtener cuentas bancarias del proveedor
        const cuentasBancarias = await prisma.cuentaBancaria.findMany({
            where: {
                proveedorId: providerId,
                activa: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Calcular resumen de saldos
        const saldoFavor = saldos
            .filter(s => s.tipoMovimiento === 'A_FAVOR')
            .reduce((sum, s) => sum + Number(s.monto), 0);

        const saldoDeuda = saldos
            .filter(s => s.tipoMovimiento === 'DEBE')
            .reduce((sum, s) => sum + Number(s.monto), 0);

        const saldoNeto = Math.abs(saldoFavor - saldoDeuda);
        const tipoSaldo = saldoFavor > saldoDeuda ? 'A_FAVOR' :
            saldoDeuda > saldoFavor ? 'DEBE' : 'NEUTRO';

        const resumenSaldo = {
            saldoFavor,
            saldoDeuda,
            saldoNeto,
            tipoSaldo
        };

        res.status(200).json({
            success: true,
            data: {
                saldos,
                cuentasBancarias,
                resumenSaldo
            }
        });

    } catch (error) {
        handleError({
            res,
            error,
            msg: 'Error al obtener datos financieros del proveedor'
        });
    }
};

// Obtener información financiera de un transporte
export const getTransportFinancialData = async (req: Request, res: Response) => {
    try {
        const { transportId } = req.params;

        // Verificar que el transporte existe
        const transporte = await prisma.transporte.findUnique({
            where: { id: parseInt(transportId) },
            include: {
                saldosTransporte: {
                    where: { activo: true },
                    orderBy: { fecha: 'desc' }
                },
                cuentasBancarias: {
                    where: { activa: true }
                }
            }
        });

        if (!transporte) {
            return res.status(404).json({ message: 'Transporte no encontrado' });
        }

        // Calcular saldo total
        const saldoTotal = transporte.saldosTransporte.reduce((total, saldo) => {
            if (saldo.tipoMovimiento === 'A_FAVOR') {
                return total + Number(saldo.monto);
            } else {
                return total - Number(saldo.monto);
            }
        }, 0);

        res.json({
            transporte: {
                id: transporte.id,
                razonSocial: transporte.razonSocial,
                ruc: transporte.ruc
            },
            saldoTotal,
            saldos: transporte.saldosTransporte,
            cuentasBancarias: transporte.cuentasBancarias
        });
    } catch (error) {
        console.error('Error obteniendo información financiera del transporte:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Crear saldo para proveedor
export const createProviderSaldo = async (req: Request, res: Response) => {
    try {
        const providerId = parseInt(req.params.providerId, 10);
        const { tipoMovimiento, monto, descripcion, banco, fecha } = req.body;

        if (isNaN(providerId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de proveedor inválido'
            });
        }

        if (!tipoMovimiento || !monto) {
            return res.status(400).json({
                success: false,
                message: 'Tipo de movimiento y monto son requeridos'
            });
        }

        const nuevoSaldo = await prisma.saldoProveedor.create({
            data: {
                proveedorId: providerId,
                tipoMovimiento,
                monto,
                descripcion,
                banco,
                fecha: fecha ? new Date(fecha) : undefined
            }
        });

        res.status(201).json({
            success: true,
            message: 'Saldo creado correctamente',
            data: nuevoSaldo
        });

    } catch (error) {
        handleError({
            res,
            error,
            msg: 'Error al crear saldo del proveedor'
        });
    }
};

// Crear saldo para transporte (placeholder - necesitarás crear tabla SaldoTransporte)
export const createTransportSaldo = async (req: Request, res: Response) => {
    try {
        const { transportId } = req.params;
        const { tipoMovimiento, monto, descripcion, banco, fecha } = req.body;

        // Validar que el transporte existe
        const transporte = await prisma.transporte.findUnique({
            where: { id: parseInt(transportId) }
        });

        if (!transporte) {
            return res.status(404).json({ message: 'Transporte no encontrado' });
        }

        // Crear el saldo del transporte
        const nuevoSaldo = await prisma.saldoTransporte.create({
            data: {
                transporteId: parseInt(transportId),
                tipoMovimiento,
                monto,
                descripcion,
                banco,
                fecha: fecha ? new Date(fecha) : undefined
            }
        });

        res.status(201).json(nuevoSaldo);
    } catch (error) {
        console.error('Error creando saldo del transporte:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Actualizar saldo
export const updateSaldo = async (req: Request, res: Response) => {
    try {
        const saldoId = parseInt(req.params.saldoId, 10);
        const { tipoMovimiento, monto, descripcion, activo, banco, fecha } = req.body;

        if (isNaN(saldoId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de saldo inválido'
            });
        }

        const saldoActualizado = await prisma.saldoProveedor.update({
            where: { id: saldoId },
            data: {
                ...(tipoMovimiento && { tipoMovimiento }),
                ...(monto && { monto }),
                ...(descripcion !== undefined && { descripcion }),
                ...(banco !== undefined && { banco }),
                ...(fecha && { fecha: new Date(fecha) }),
                ...(activo !== undefined && { activo })
            }
        });

        res.status(200).json({
            success: true,
            message: 'Saldo actualizado correctamente',
            data: saldoActualizado
        });

    } catch (error) {
        handleError({
            res,
            error,
            msg: 'Error al actualizar saldo'
        });
    }
};

// Actualizar saldo de transporte
export const updateTransportSaldo = async (req: Request, res: Response) => {
    try {
        const saldoId = parseInt(req.params.saldoId, 10);
        const { tipoMovimiento, monto, descripcion, activo, banco, fecha } = req.body;

        if (isNaN(saldoId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de saldo inválido'
            });
        }

        const saldoActualizado = await prisma.saldoTransporte.update({
            where: { id: saldoId },
            data: {
                ...(tipoMovimiento && { tipoMovimiento }),
                ...(monto && { monto }),
                ...(descripcion !== undefined && { descripcion }),
                ...(banco !== undefined && { banco }),
                ...(fecha && { fecha: new Date(fecha) }),
                ...(activo !== undefined && { activo })
            }
        });

        res.status(200).json({
            success: true,
            message: 'Saldo de transporte actualizado correctamente',
            data: saldoActualizado
        });

    } catch (error) {
        handleError({
            res,
            error,
            msg: 'Error al actualizar saldo de transporte'
        });
    }
};

// Eliminar saldo de transporte
export const deleteTransportSaldo = async (req: Request, res: Response) => {
    try {
        const saldoId = parseInt(req.params.saldoId, 10);

        if (isNaN(saldoId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de saldo inválido'
            });
        }

        // Soft delete - marcar como inactivo
        await prisma.saldoTransporte.update({
            where: { id: saldoId },
            data: { activo: false }
        });

        res.status(200).json({
            success: true,
            message: 'Saldo de transporte eliminado correctamente'
        });

    } catch (error) {
        handleError({
            res,
            error,
            msg: 'Error al eliminar saldo de transporte'
        });
    }
};

// Eliminar saldo de proveedor
export const deleteSaldo = async (req: Request, res: Response) => {
    try {
        const saldoId = parseInt(req.params.saldoId, 10);

        if (isNaN(saldoId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de saldo inválido'
            });
        }

        // Soft delete - marcar como inactivo
        await prisma.saldoProveedor.update({
            where: { id: saldoId },
            data: { activo: false }
        });

        res.status(200).json({
            success: true,
            message: 'Saldo eliminado correctamente'
        });

    } catch (error) {
        handleError({
            res,
            error,
            msg: 'Error al eliminar saldo'
        });
    }
};
