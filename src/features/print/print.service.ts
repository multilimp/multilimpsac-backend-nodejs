import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import dayjs from 'dayjs';
import prisma from '../../database/prisma'; // Ajusta la ruta a tu cliente Prisma

// Función para procesar el logo de la empresa
const processEmpresaLogo = async (logoPath: string | null): Promise<string> => {
  // Si no hay logo en BD, usar el de assets como respaldo
  if (!logoPath) {
    console.log('No hay logo en BD, usando respaldo desde assets');
    const fallbackLogoPath = path.join(process.cwd(), 'assets', 'images.png');
    return getImageAsBase64(fallbackLogoPath);
  }

  try {
    // Si es una URL completa (http/https), devolverla directamente
    if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
      return logoPath;
    }

    // Si es una ruta relativa, construir la ruta completa desde assets
    const fullPath = logoPath.startsWith('/')
      ? path.join(process.cwd(), logoPath.substring(1)) // Remover "/" inicial si existe
      : path.join(process.cwd(), 'assets', logoPath);

    const imageBuffer = await fs.readFile(fullPath);
    const base64String = imageBuffer.toString('base64');
    const mimeType = fullPath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${base64String}`;
  } catch (error) {
    console.warn('No se pudo cargar el logo desde BD:', logoPath, 'usando respaldo desde assets');
    // Si falla cargar el logo de BD, usar el de assets como respaldo
    const fallbackLogoPath = path.join(process.cwd(), 'assets', 'images.png');
    return getImageAsBase64(fallbackLogoPath);
  }
};

// Función para convertir imagen a base64 (mantenida para compatibilidad)
const getImageAsBase64 = async (imagePath: string): Promise<string> => {
  try {
    const imageBuffer = await fs.readFile(imagePath);
    const base64String = imageBuffer.toString('base64');
    const mimeType = imagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${base64String}`;
  } catch (error) {
    console.warn('No se pudo cargar el logo de respaldo:', imagePath, error);
    return ''; // Si ni siquiera el respaldo funciona, devolver vacío
  }
};

interface ProductoOrdenCompra {
  codigo: string;
  cantidad: number;
  unidad_medida?: string;
  descripcion: string;
  precio_unitario: number; // Asegúrate que el tipo sea correcto (number o string)
  total: number;          // Asegúrate que el tipo sea correcto (number o string)
}

// Registrar helpers de Handlebars de forma global
handlebars.registerHelper('formatCurrency', (value: any) => {
  if (typeof value === 'number') {
    return 'S/ ' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  return value; // Devuelve el valor original si no es un número
});

handlebars.registerHelper('or', function (this: any, v1: any, v2: any, options: any) {
  if (v1 || v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

export const generateFacturaPDF = async (ordenCompraId: number): Promise<Buffer> => {
  const facturaData = await prisma.facturacion.findFirst({
    where: { ordenCompraId: ordenCompraId }, // ✅ CORRECCIÓN: Buscar por ordenCompraId
    include: {
      ordenCompra: {
        include: {
          empresa: {
            select: {
              razonSocial: true,
              ruc: true,
              direccion: true,
              telefono: true,
            },
          },
          cliente: {
            select: {
              razonSocial: true,
              ruc: true,
              // Campos de dirección del cliente si son necesarios para la factura
              direccion: true,
              distrito: true,
              provincia: true,
              departamento: true,
            },
          },
          // contactoCliente: true, // Si es necesario para la factura
        },
      },
    },
  });

  if (!facturaData) {
    throw new Error(`Factura para orden de compra ID ${ordenCompraId} no encontrada.`); // ✅ CORRECCIÓN: Mensaje más claro
  }

  if (!facturaData.ordenCompra) {
    throw new Error(`La factura para orden de compra ID ${ordenCompraId} no tiene una orden de compra asociada.`); // ✅ CORRECCIÓN: Usar ordenCompraId
  }

  // Validar que productos sea un array antes de pasarlo
  let productosOrden: ProductoOrdenCompra[] = [];
  if (facturaData.ordenCompra.productos && Array.isArray(facturaData.ordenCompra.productos)) {
    productosOrden = facturaData.ordenCompra.productos as unknown as ProductoOrdenCompra[];
  } else if (facturaData.ordenCompra.productos) {
    // Si no es un array pero existe, intenta convertirlo o manejar el error
    // Esto es un placeholder, ajusta según la estructura real de tu JSON 'productos'
    console.warn(`El campo 'productos' de la orden de compra ID ${facturaData.ordenCompra.id} no es un array.`);
    // Podrías intentar parsearlo si es un string JSON de un array, o envolverlo si es un solo objeto
  }


  const templateHtmlPath = path.join(__dirname, 'templates', 'factura.hbs');
  const templateCssPath = path.join(__dirname, 'styles', 'factura.css');

  const [htmlTemplate, cssStyles] = await Promise.all([
    fs.readFile(templateHtmlPath, 'utf-8'),
    fs.readFile(templateCssPath, 'utf-8'),
  ]);

  const template = handlebars.compile(htmlTemplate);

  // Prepara los datos para la plantilla
  const dataForTemplate = {
    facturacion: facturaData,
    orden: facturaData.ordenCompra, // Para mantener consistencia con la plantilla original si es necesario
    empresa: facturaData.ordenCompra.empresa,
    cliente: facturaData.ordenCompra.cliente,
    productos: productosOrden, // Usar los productos parseados/validados
    css: cssStyles,
    // Puedes añadir más datos aquí si son necesarios, como fecha actual, etc.
    fechaActual: new Date().toLocaleDateString('es-ES'),
    // Formatear números si es necesario (Handlebars helpers pueden ser útiles para esto)
  };

  const finalHtml = template(dataForTemplate);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // Necesario en algunos entornos (ej. Docker)
  });
  const page = await browser.newPage();

  await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

  const pdfData = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20px',
      right: '20px',
      bottom: '20px',
      left: '20px',
    },
  });

  await browser.close();
  return Buffer.from(pdfData); // Convertir a Buffer de Node.js
};

export const generateOrdenProveedorPDF = async (id: number): Promise<Buffer> => {
  const ordenProveedorData = await prisma.ordenProveedor.findUnique({
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
          logo: true, // ✅ AGREGAR: Campo logo desde la BD
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
    },
  });

  if (!ordenProveedorData) {
    throw new Error(`Orden de proveedor con ID ${id} no encontrada.`);
  }

  const templateHtmlPath = path.join(__dirname, 'templates', 'orden-proveedor.hbs');
  const templateCssPath = path.join(__dirname, 'styles', 'orden-proveedor.css');

  const [htmlTemplate, cssStyles, logoBase64] = await Promise.all([
    fs.readFile(templateHtmlPath, 'utf-8'),
    fs.readFile(templateCssPath, 'utf-8'),
    processEmpresaLogo(ordenProveedorData.empresa?.logo || null), // ✅ USAR logo desde BD
  ]);

  const template = handlebars.compile(htmlTemplate);

  // Prepara los datos para la plantilla
  const dataForTemplate = {
    ordenProveedor: ordenProveedorData,
    empresa: ordenProveedorData.empresa,
    proveedor: ordenProveedorData.proveedor,
    contactoProveedor: ordenProveedorData.contactoProveedor,
    productos: ordenProveedorData.productos || [],
    ordenCompra: ordenProveedorData.ordenCompra,
    css: cssStyles,
    logoEmpresa: logoBase64, // Logo desde BD procesado
    fechaActual: new Date().toLocaleDateString('es-ES'),
  };

  const finalHtml = template(dataForTemplate);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

  const pdfData = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20px',
      right: '20px',
      bottom: '20px',
      left: '20px',
    },
  });

  await browser.close();
  return Buffer.from(pdfData);
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
            telefono: op.contactoProveedor.telefono || ''
          } : undefined
        },
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
            telefono: op.ordenCompra.contactoCliente.telefono || ''
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

// Registrar helpers de Handlebars para reportes
handlebars.registerHelper('formatCurrency', (value: number) => {
  if (!value) return 'S/ 0.00';
  return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
});

handlebars.registerHelper('eq', (a: any, b: any) => a === b);
handlebars.registerHelper('inc', (value: number) => value + 1);
