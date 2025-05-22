import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import prisma from '../../database/prisma'; // Ajusta la ruta a tu cliente Prisma

interface ProductoOrdenCompra {
  codigo: string;
  cantidad: number;
  unidad_medida?: string;
  descripcion: string;
  precio_unitario: number; // Asegúrate que el tipo sea correcto (number o string)
  total: number;          // Asegúrate que el tipo sea correcto (number o string)
}

export const generateFacturaPDF = async (id: number): Promise<Buffer> => {
  const facturaData = await prisma.facturacion.findUnique({
    where: { id },
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
    throw new Error(`Factura con ID ${id} no encontrada.`);
  }
  
  if (!facturaData.ordenCompra) {
    throw new Error(`La factura con ID ${id} no tiene una orden de compra asociada.`);
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
  
  // Registrar helper para formatear números si no lo tienes globalmente
  handlebars.registerHelper('formatCurrency', (value: any) => { // Añadido :any a value por si acaso, aunque el error principal es 'this'
    if (typeof value === 'number') {
      return 'S/ ' + value.toFixed(2).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');
    }
    return value; // Devuelve el valor original si no es un número
  });
  
  handlebars.registerHelper('or', function(this: any, v1: any, v2: any, options: any) {
    if (v1 || v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

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
