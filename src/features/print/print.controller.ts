import { Request, Response } from 'express';
import { generateCargosEntregaHtml, generateCargosEntregaReport, generateFacturaPDF, generateOrdenProveedorPDF } from './print.service';
import { handleError } from '../../shared/middleware/handleError';
import dayjs from 'dayjs';
import prisma from '../../database/prisma';

// Comentado temporalmente - funcionalidad de factura
/* export const generateFacturaPDFHandler = async (req: Request, res: Response) => {
  try {
    const ordenCompraId = parseInt(req.params.ordenCompraId, 10);
    if (isNaN(ordenCompraId)) {
      return res.status(400).json({ success: false, message: 'ID de orden de compra inválido.' });
    }

    const pdfBuffer = await generateFacturaPDF(ordenCompraId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="factura-oc-${ordenCompraId}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    handleError({ res, error, msg: 'Error al generar el PDF de la factura.' });
  }
}; */
/*
// Funciones comentadas - ya no se usan porque la generación se hace en el frontend
export const getCargosEntregaReport = async (req: Request, res: Response) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren fechaInicio y fechaFin como parámetros de consulta'
      });
    }

    const pdfBuffer = await generateCargosEntregaReport(
      new Date(fechaInicio as string),
      new Date(fechaFin as string)
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="cargos-entrega-${fechaInicio}-${fechaFin}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    handleError({ res, error, msg: 'Error al generar el reporte de cargos de entrega' });
  }
};

export const getCargosEntregaHtml = async (req: Request, res: Response) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren fechaInicio y fechaFin como parámetros de consulta'
      });
    }

    const html = await generateCargosEntregaHtml(
      new Date(fechaInicio as string),
      new Date(fechaFin as string)
    );

    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  } catch (error) {
    handleError({ res, error, msg: 'Error al generar la previsualización del reporte de cargos de entrega' });
  }
};
*/

export const generateOrdenProveedorPDFHandler = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID de orden de proveedor inválido.' });
    }

    const pdfBuffer = await generateOrdenProveedorPDF(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="orden-proveedor-${id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    handleError({ res, error, msg: 'Error al generar el PDF de la orden de proveedor.' });
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
            telefono: op.contactoProveedor.telefono || ''
          } : undefined
        },
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
            telefono: op.ordenCompra.contactoCliente.telefono || ''
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
