import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import dayjs from 'dayjs';
import prisma from '../../database/prisma';

interface ProductoOrdenCompra {
  codigo: string;
  cantidad: number;
  unidad_medida?: string;
  descripcion: string;
  precio_unitario: number; // Asegúrate que el tipo sea correcto (number o string)
  total: number;          // Asegúrate que el tipo sea correcto (number o string)
}

export const getOrdenProveedorPrintData = async (id: number) => {
  const ordenProveedor = await prisma.ordenProveedor.findUnique({
    where: { id },
    include: {
      empresa: {
        select: {
          razonSocial: true,
          ruc: true,
          direccion: true,
          telefono: true,
          email: true,
          web: true,
          direcciones: true,
          logo: true,
        },
      },
      proveedor: {
        select: {
          razonSocial: true,
          ruc: true,
          direccion: true,
          telefono: true,
          email: true,
        },
      },
      contactoProveedor: {
        select: {
          nombre: true,
          telefono: true,
          email: true,
          cargo: true,
        },
      },
      productos: true,
      ordenCompra: {
        select: {
          codigoVenta: true,
          fechaEmision: true,
          fechaEntrega: true,
          montoVenta: true,
          direccionEntrega: true,
          distritoEntrega: true,
          provinciaEntrega: true,
          departamentoEntrega: true,
          referenciaEntrega: true,
          cliente: {
            select: {
              razonSocial: true,
              ruc: true,
              direccion: true,
            },
          },
          contactoCliente: {
            select: {
              nombre: true,
              telefono: true,
              email: true,
              cargo: true,
            },
          },
        },
      },
      transportesAsignados: {
        include: {
          transporte: true,
          contactoTransporte: true,
          almacen: true,
        },
      },
    },
  });

  if (!ordenProveedor) {
    throw new Error(`Orden de proveedor con ID ${id} no encontrada.`);
  }
  return {
    data: ordenProveedor
  };
};

// Interfaces para reportes de cargos de entrega
interface OpCargosEntrega {
  id: number;
  codigoOp: string;
  ocf: string | null;
  estadoOp: string | null;
  fechaProgramada: Date | null;
  productos: Array<{
    codigo: string;
    descripcion: string;
    cantidad: number;
  }>;
  proveedor: {
    razonSocial: string;
    contacto?: {
      nombre: string;
      telefono: string;
      cargo?: string;
    };
  };
  transporteAsignado?: {
    transporte: {
      razonSocial: string;
      ruc: string;
      direccion?: string;
      telefono?: string;
    };
    contactoTransporte?: {
      nombre: string;
      telefono: string;
      cargo?: string;
    };
    codigoTransporte: string;
    direccion?: string;
    montoFlete?: number;
    notaTransporte?: string;
    almacen?: {
      nombre: string;
      direccion?: string;
    };
  };
  destino: {
    tipo: string;
    cliente?: {
      razonSocial: string;
    };
    direccion: string;
    distrito: string;
    provincia: string;
    departamento: string;
    referencia?: string;
    contacto?: {
      nombre: string;
      telefono: string;
      cargo?: string;
    };
  };
  observacion?: string;
}

interface FechaCargos {
  fecha: string;
  ops: OpCargosEntrega[];
}

// Función para determinar el tipo de destino
function determinarTipoDestino(ordenCompra: any): string {
  if (ordenCompra?.cliente) {
    return 'Cliente';
  }
  return 'Destino';
}

// Función para generar reporte PDF de cargos de entrega
export const generateCargosEntregaReport = async (fechaInicio: Date, fechaFin: Date): Promise<Buffer> => {
  const html = await generateCargosEntregaHtml(fechaInicio, fechaFin);

  // Generar PDF
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm'
    },
    printBackground: true
  });

  await browser.close();
  return Buffer.from(pdfBuffer);
};

// Función para generar HTML del reporte de cargos de entrega
export const generateCargosEntregaHtml = async (fechaInicio: Date, fechaFin: Date): Promise<string> => {
  try {
    // Obtener todas las OPs con fechaProgramada en el rango especificado
    const ordenesProveedor = await prisma.ordenProveedor.findMany({
      where: {
        fechaProgramada: {
          gte: fechaInicio,
          lte: fechaFin
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

    // Agrupar por fecha de programación
    const opsPorFecha = new Map<string, OpCargosEntrega[]>();

    for (const op of ordenesProveedor) {
      const fechaKey = op.fechaProgramada ? dayjs(op.fechaProgramada).format('YYYY-MM-DD') : 'sin-fecha';

      if (!opsPorFecha.has(fechaKey)) {
        opsPorFecha.set(fechaKey, []);
      }

      const opData: OpCargosEntrega = {
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
          tipo: determinarTipoDestino(op.ordenCompra),
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

    // Convertir a array ordenado por fecha
    const fechasConCargos: FechaCargos[] = Array.from(opsPorFecha.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fecha, ops]) => ({
        fecha: fecha === 'sin-fecha' ? 'Sin fecha programada' : dayjs(fecha).format('DD/MM/YYYY'),
        ops: ops.map((op, index) => ({ ...op, numero: index + 1 }))
      }));

    // Datos para el template
    const templateData = {
      fechaInicio: dayjs(fechaInicio).format('DD/MM/YYYY'),
      fechaFin: dayjs(fechaFin).format('DD/MM/YYYY'),
      fechaGeneracion: dayjs().format('DD/MM/YYYY HH:mm'),
      fechasConCargos,
      totalOps: ordenesProveedor.length
    };

    // Leer template y CSS
    const templatePath = path.join(__dirname, 'templates', 'cargos-entrega.hbs');
    const cssPath = path.join(__dirname, 'styles', 'cargos-entrega.css');

    const [templateHtml, cssContent] = await Promise.all([
      fs.readFile(templatePath, 'utf-8'),
      fs.readFile(cssPath, 'utf-8')
    ]);

    // Registrar helper para incrementar índice
    handlebars.registerHelper('increment', function (value: number) {
      return value + 1;
    });

    // Compilar template
    const template = handlebars.compile(templateHtml);
    const html = template({ ...templateData, css: cssContent });

    return html;

  } catch (error) {
    console.error('Error generando HTML del reporte de cargos de entrega:', error);
    throw new Error(`Error al generar el HTML: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};
