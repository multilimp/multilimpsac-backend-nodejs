import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
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

handlebars.registerHelper('or', function(this: any, v1: any, v2: any, options: any) {
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
