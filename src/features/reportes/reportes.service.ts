import fs from 'fs/promises';
import path from 'path';
import handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import dayjs from 'dayjs';
import prisma from '../../database/prisma';

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

export const generateCargosEntregaReport = async (fechaInicio: Date, fechaFin: Date): Promise<Buffer> => {
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

    } catch (error) {
        console.error('Error generando reporte de cargos de entrega:', error);
        throw new Error(`Error al generar el reporte: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
};

function determinarTipoDestino(ordenCompra: any): string {
    // Lógica para determinar el tipo de destino basado en los datos de la orden
    if (ordenCompra?.cliente) {
        return 'Cliente';
    }
    return 'Destino';
}

// Registrar helpers de Handlebars
handlebars.registerHelper('formatCurrency', (value: number) => {
    if (!value) return 'S/ 0.00';
    return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
});

handlebars.registerHelper('eq', (a: any, b: any) => a === b);
handlebars.registerHelper('inc', (value: number) => value + 1);
