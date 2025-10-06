import { Request, Response } from 'express';
import { getOrdenProveedorPrintData } from './print.service';
import { handleError } from '../../shared/middleware/handleError';
import dayjs from 'dayjs';
import prisma from '../../database/prisma';

export const getOrdenProveedorPrintDataHandler = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID de orden de proveedor inválido.' });
    }

    const data = await getOrdenProveedorPrintData(id);

    res.json({ success: true, data });
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener datos para imprimir la orden de proveedor.' });
  }
};

export const getCargosEntregaData = async (req: Request, res: Response) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren fechaInicio y fechaFin como parámetros de consulta'
      });
    }

    // Obtener los datos usando la lógica de generateCargosEntregaHtml pero sin generar HTML
    const ordenesProveedor = await prisma.ordenProveedor.findMany({
      where: {
        fechaProgramada: {
          gte: new Date(fechaInicio as string),
          lte: new Date(fechaFin as string)
        },
        activo: true
      },
      include: {
        productos: true,
        proveedor: true,
        contactoProveedor: true,
        transportesAsignados: {
          include: {
            transporte: true,
            contactoTransporte: true,
            almacen: true
          }
        },
        ordenCompra: {
          include: {
            cliente: true,
            contactoCliente: true
          }
        }
      },
      orderBy: [
        { fechaProgramada: 'asc' },
        { codigoOp: 'asc' }
      ]
    });

    // Procesar los datos igual que en generateCargosEntregaHtml
    const opsPorFecha = new Map<string, any[]>();

    for (const op of ordenesProveedor) {
      const fechaKey = op.fechaProgramada ? dayjs(op.fechaProgramada).format('YYYY-MM-DD') : 'sin-fecha';

      if (!opsPorFecha.has(fechaKey)) {
        opsPorFecha.set(fechaKey, []);
      }

      const opData = {
        id: op.id,
        codigoOp: op.codigoOp,
        ocf: op.ordenCompra?.documentoOcf || null,
        estadoOp: op.estadoOp || null,
        fechaProgramada: op.fechaProgramada,
        productos: op.productos.map(p => ({
          codigo: p.codigo || '',
          descripcion: p.descripcion || '',
          cantidad: p.cantidad || 0
        })),
        proveedor: {
          razonSocial: op.proveedor?.razonSocial || '',
          contacto: op.contactoProveedor ? {
            nombre: op.contactoProveedor.nombre || '',
            telefono: op.contactoProveedor.telefono || '',
            cargo: op.contactoProveedor.cargo || undefined
          } : undefined
        },
        transporteAsignado: op.transportesAsignados && op.transportesAsignados.length > 0 ? {
          transporte: {
            razonSocial: op.transportesAsignados[0].transporte.razonSocial || '',
            ruc: op.transportesAsignados[0].transporte.ruc || '',
            direccion: op.transportesAsignados[0].transporte.direccion || undefined,
            telefono: op.transportesAsignados[0].transporte.telefono || undefined
          },
          contactoTransporte: op.transportesAsignados[0].contactoTransporte ? {
            nombre: op.transportesAsignados[0].contactoTransporte.nombre || '',
            telefono: op.transportesAsignados[0].contactoTransporte.telefono || '',
            cargo: op.transportesAsignados[0].contactoTransporte.cargo || undefined
          } : undefined,
          codigoTransporte: op.transportesAsignados[0].codigoTransporte || '',
          direccion: op.transportesAsignados[0].direccion || undefined,
          montoFlete: op.transportesAsignados[0].montoFlete ? Number(op.transportesAsignados[0].montoFlete) : undefined,
          notaTransporte: op.transportesAsignados[0].notaTransporte || undefined,
          almacen: op.transportesAsignados[0].almacen ? {
            nombre: op.transportesAsignados[0].almacen.nombre || '',
            direccion: op.transportesAsignados[0].almacen.direccion || undefined
          } : undefined
        } : undefined,
        destino: {
          tipo: op.ordenCompra?.cliente ? 'Cliente' : 'Destino',
          cliente: op.ordenCompra?.cliente ? {
            razonSocial: op.ordenCompra.cliente.razonSocial || ''
          } : undefined,
          direccion: op.ordenCompra?.direccionEntrega || '',
          distrito: op.ordenCompra?.distritoEntrega || '',
          provincia: op.ordenCompra?.provinciaEntrega || '',
          departamento: op.ordenCompra?.departamentoEntrega || '',
          referencia: op.ordenCompra?.referenciaEntrega || undefined,
          contacto: op.ordenCompra?.contactoCliente ? {
            nombre: op.ordenCompra.contactoCliente.nombre || '',
            telefono: op.ordenCompra.contactoCliente.telefono || '',
            cargo: op.ordenCompra.contactoCliente.cargo || undefined
          } : undefined
        },
        observacion: op.observaciones || undefined
      };

      opsPorFecha.get(fechaKey)!.push(opData);
    }

    const fechasConCargos = Array.from(opsPorFecha.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fecha, ops]) => ({
        fecha: fecha === 'sin-fecha' ? 'Sin fecha programada' : dayjs(fecha).format('DD/MM/YYYY'),
        ops: ops.map((op: any, index: number) => ({ ...op, numero: index + 1 }))
      }));

    const data = {
      fechaInicio: dayjs(fechaInicio as string).format('DD/MM/YYYY'),
      fechaFin: dayjs(fechaFin as string).format('DD/MM/YYYY'),
      fechaGeneracion: dayjs().format('DD/MM/YYYY HH:mm'),
      fechasConCargos,
      totalOps: ordenesProveedor.length
    };

    res.json({
      success: true,
      data
    });

  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener los datos de cargos de entrega' });
  }
};
