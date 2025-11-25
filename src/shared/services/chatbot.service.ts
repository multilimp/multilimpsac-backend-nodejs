import { PrismaClient } from '../../../prisma/generated/client';
import axios from 'axios';

// Configuración de Gemini
const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY || '';

export class ChatbotService {
    private prisma: PrismaClient;
    private geminiApiUrl: string;

    constructor() {
        this.prisma = new PrismaClient();
        this.geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
    }

    private async callGemini(prompt: string): Promise<string> {
        try {
            const response = await axios.post(this.geminiApiUrl, {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0
                }
            });

            if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                return response.data.candidates[0].content.parts[0].text;
            }

            return 'No pude procesar la consulta correctamente.';
        } catch (error) {
            console.error('Error llamando a Gemini API:', error);
            throw error;
        }
    }

    async processQuery(userQuery: string): Promise<string> {
        try {
            const query = userQuery.toLowerCase();

            // Consultas específicas para Multilimp ERP
            if (query.includes('ventas') && query.includes('total')) {
                const ventas = await this.prisma.ordenCompra.findMany({
                    select: {
                        id: true,
                        codigoVenta: true,
                        montoVenta: true,
                        fechaEmision: true,
                        cliente: {
                            select: {
                                razonSocial: true,
                                ruc: true,
                            },
                        },
                    },
                });

                const total = ventas.reduce((sum, venta) => sum + Number(venta.montoVenta), 0);

                return `📊 **Resumen de Ventas**\n\n` +
                    `💰 Total de ventas: **S/ ${total.toFixed(2)}**\n` +
                    `📈 Número de ventas: **${ventas.length}**\n\n` +
                    `🛒 Últimas 5 ventas:\n` +
                    ventas.slice(0, 5).map(v =>
                        `• ${v.codigoVenta}: S/ ${Number(v.montoVenta).toFixed(2)} - ${v.cliente?.razonSocial}`
                    ).join('\n');
            }

            if (query.includes('proveedores') || query.includes('ordenes proveedor') || query.includes('op')) {
                const ops = await this.prisma.ordenProveedor.findMany({
                    select: {
                        id: true,
                        codigoOp: true,
                        totalProveedor: true,
                        fechaDespacho: true,
                        proveedor: {
                            select: {
                                razonSocial: true,
                                ruc: true,
                            },
                        },
                    },
                });

                const total = ops.reduce((sum, op) => sum + (Number(op.totalProveedor) || 0), 0);

                return `📦 **Resumen de Órdenes de Proveedor**\n\n` +
                    `💰 Total de órdenes: **S/ ${total.toFixed(2)}**\n` +
                    `📋 Número de órdenes: **${ops.length}**\n\n` +
                    `🚚 Últimas 5 órdenes:\n` +
                    ops.slice(0, 5).map(op =>
                        `• ${op.codigoOp}: S/ ${(Number(op.totalProveedor) || 0).toFixed(2)} - ${op.proveedor?.razonSocial}`
                    ).join('\n');
            }

            if (query.includes('clientes')) {
                const clientes = await this.prisma.cliente.findMany({
                    select: {
                        id: true,
                        razonSocial: true,
                        ruc: true,
                        codigoUnidadEjecutora: true,
                    },
                });

                return `👥 **Lista de Clientes**\n\n` +
                    `Total de clientes: **${clientes.length}**\n\n` +
                    clientes.slice(0, 10).map(c =>
                        `• ${c.razonSocial} (RUC: ${c.ruc}) - CUE: ${c.codigoUnidadEjecutora || 'N/A'}`
                    ).join('\n');
            }

            if (query.includes('transportes')) {
                const transportes = await this.prisma.transporteAsignado.findMany({
                    select: {
                        id: true,
                        codigoTransporte: true,
                        montoFlete: true,
                        estadoPago: true,
                        transporte: {
                            select: {
                                razonSocial: true,
                            },
                        },
                    },
                });

                const totalFlete = transportes.reduce((sum, t) => sum + (Number(t.montoFlete) || 0), 0);

                return `🚛 **Resumen de Transportes**\n\n` +
                    `💰 Total flete: **S/ ${totalFlete.toFixed(2)}**\n` +
                    `📦 Número de transportes: **${transportes.length}**\n\n` +
                    `🚚 Transportes activos:\n` +
                    transportes.slice(0, 5).map(t =>
                        `• ${t.codigoTransporte}: S/ ${(Number(t.montoFlete) || 0).toFixed(2)} - ${t.transporte?.razonSocial} (${t.estadoPago})`
                    ).join('\n');
            }

            // Para consultas más complejas, usar procesamiento con IA
            const prompt = `
        Eres un asistente especializado en el sistema ERP Multilimp.
        La base de datos contiene información sobre ventas, proveedores, clientes, transportes y más.

        Consulta del usuario: "${userQuery}"

        Por favor, proporciona una respuesta útil basada en el contexto del sistema ERP.
        Si no puedes responder con datos específicos, explica qué información adicional necesitas.
      `;

            const response = await this.callGemini(prompt);
            return response;

        } catch (error) {
            console.error('Error procesando consulta:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            return `❌ Lo siento, tuve un problema procesando tu consulta: ${errorMessage}`;
        }
    }

    // Método para obtener estadísticas generales
    async getDashboardStats(): Promise<string> {
        try {
            const [ventasCount, opsCount, clientesCount, transportesCount] = await Promise.all([
                this.prisma.ordenCompra.count(),
                this.prisma.ordenProveedor.count(),
                this.prisma.cliente.count(),
                this.prisma.transporteAsignado.count(),
            ]);

            const ventasTotal = await this.prisma.ordenCompra.aggregate({
                _sum: {
                    montoVenta: true,
                },
            });

            const opsTotal = await this.prisma.ordenProveedor.aggregate({
                _sum: {
                    totalProveedor: true,
                },
            });

            return `📊 **Estadísticas del Sistema**\n\n` +
                `💰 Total Ventas: **S/ ${(Number(ventasTotal._sum.montoVenta) || 0).toFixed(2)}**\n` +
                `📦 Total Órdenes Proveedor: **S/ ${(Number(opsTotal._sum.totalProveedor) || 0).toFixed(2)}**\n\n` +
                `📈 Registros:\n` +
                `• Ventas: **${ventasCount}**\n` +
                `• Órdenes Proveedor: **${opsCount}**\n` +
                `• Clientes: **${clientesCount}**\n` +
                `• Transportes: **${transportesCount}**`;
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return 'Error obteniendo estadísticas del sistema';
        }
    }

    // Método para obtener acciones rápidas
    async getQuickActions(): Promise<any[]> {
        return [
            {
                id: '1',
                title: 'Resumen de Ventas',
                description: 'Ver total de ventas y estadísticas generales',
                query: 'Muéstrame el resumen de ventas totales'
            },
            {
                id: '2',
                title: 'Lista de Clientes',
                description: 'Ver todos los clientes registrados',
                query: 'Muéstrame la lista de clientes'
            },
            {
                id: '3',
                title: 'Órdenes de Proveedor',
                description: 'Ver resumen de órdenes de proveedor',
                query: 'Muéstrame las órdenes de proveedor'
            },
            {
                id: '4',
                title: 'Transportes',
                description: 'Ver información de transportes y fletes',
                query: 'Muéstrame información de transportes'
            },
            {
                id: '5',
                title: 'Estadísticas Generales',
                description: 'Ver estadísticas completas del sistema',
                query: 'Muéstrame las estadísticas generales del sistema'
            }
        ];
    }

    async disconnect() {
        await this.prisma.$disconnect();
    }
}

// Instancia singleton del servicio
export const chatbotService = new ChatbotService();
