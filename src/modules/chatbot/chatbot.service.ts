import OpenAI from 'openai';
import prisma from '../../database/prisma';
import { ChatMessage, QueryIntent, ChatbotResponse, DatabaseSchema } from './chatbot.types';
import { config } from '../../shared/config/env';

class ChatbotService {
  private openai: OpenAI;
  private schema: DatabaseSchema = { tables: {} };

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
    this.initializeSchema();
  }

  private async initializeSchema() {
    // Definir el schema de tu BD para el contexto del AI
    this.schema = {
      tables: {
        usuarios: {
          columns: {
            id: { type: 'number', nullable: false, description: 'ID único del usuario' },
            nombre: { type: 'string', nullable: false, description: 'Nombre completo del usuario' },
            email: { type: 'string', nullable: false, description: 'Email del usuario' },
            role: { type: 'enum', nullable: false, description: 'Rol: ADMIN o USER' },
            estado: { type: 'boolean', nullable: false, description: 'Estado activo/inactivo' },
            permisos: { type: 'string[]', nullable: false, description: 'Lista de permisos del usuario' }
          },
          relationships: {
            gestionCobranzas: { table: 'gestion_cobranzas', type: 'one-to-many' }
          }
        },
        clientes: {
          columns: {
            id: { type: 'number', nullable: false, description: 'ID único del cliente' },
            razonSocial: { type: 'string', nullable: false, description: 'Razón social del cliente' },
            ruc: { type: 'string', nullable: false, description: 'RUC del cliente' },
            email: { type: 'string', nullable: true, description: 'Email de contacto' },
            estado: { type: 'boolean', nullable: false, description: 'Estado activo/inactivo' }
          },
          relationships: {
            ordenesCompra: { table: 'ordenes_compra', type: 'one-to-many' },
            contactos: { table: 'contactos', type: 'one-to-many' }
          }
        },
        ordenes_compra: {
          columns: {
            id: { type: 'number', nullable: false, description: 'ID único de la orden' },
            codigoVenta: { type: 'string', nullable: false, description: 'Código de venta único' },
            fechaEmision: { type: 'date', nullable: true, description: 'Fecha de emisión' },
            montoVenta: { type: 'decimal', nullable: true, description: 'Monto total de venta' },
            etapaActual: { type: 'string', nullable: false, description: 'Etapa actual del proceso' },
            estadoVenta: { type: 'string', nullable: false, description: 'Estado de la venta' }
          },
          relationships: {
            cliente: { table: 'clientes', type: 'one-to-one' },
            empresa: { table: 'empresas', type: 'one-to-one' }
          }
        }
        // Agregar más tablas según necesites
      }
    };
  }

  async processMessage(message: string, userId: number): Promise<ChatbotResponse> {
    try {
      // 1. Analizar intención del usuario
      const intent = await this.analyzeIntent(message);
      
      // 2. Generar SQL basado en la intención
      const sqlQuery = await this.generateSQL(message, intent);
      
      // 3. Validar y ejecutar query
      const data = await this.executeQuery(sqlQuery);
      
      // 4. Generar respuesta natural
      const response = await this.generateResponse(message, data, intent);
      
      return response;
    } catch (error) {
      console.error('Error en chatbot:', error);
      return {
        message: 'Lo siento, ocurrió un error al procesar tu consulta. ¿Puedes reformularla?',
        suggestions: [
          'Muéstrame los clientes activos',
          'Lista las órdenes de compra de este mes',
          'Cuántos usuarios hay en el sistema'
        ]
      };
    }
  }

  private async analyzeIntent(message: string): Promise<QueryIntent> {
    const prompt = `
Analiza la siguiente consulta del usuario y determina la intención:
Mensaje: "${message}"

Contexto: Sistema ERP para empresa de limpieza con tablas: usuarios, clientes, proveedores, ordenes_compra, productos, contactos.

Responde SOLO con un JSON válido:
{
  "type": "list|count|filter|aggregate|create|update|delete",
  "entity": "usuarios|clientes|proveedores|ordenes_compra|productos|contactos",
  "filters": {},
  "limit": 10,
  "orderBy": "createdAt"
}`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 200
    });

    try {
      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch {
      // Fallback por defecto
      return {
        type: 'list',
        entity: 'clientes',
        limit: 10
      };
    }
  }

  private async generateSQL(message: string, intent: QueryIntent): Promise<string> {
    const schemaContext = JSON.stringify(this.schema, null, 2);
    
    const prompt = `
Eres un experto en SQL y Prisma. Genera una consulta SQL segura basada en:

Mensaje del usuario: "${message}"
Intención detectada: ${JSON.stringify(intent)}
Schema de la base de datos:
${schemaContext}

REGLAS IMPORTANTES:
1. USA SOLO SELECT, no INSERT/UPDATE/DELETE
2. Usa nombres de tabla y columna exactos del schema
3. Incluye LIMIT para evitar consultas masivas
4. Usa parámetros seguros, no concatenación
5. Responde SOLO con la consulta SQL, sin explicaciones

Ejemplo de respuesta:
SELECT id, nombre, email, role FROM usuarios WHERE estado = true LIMIT 10;
`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 300
    });

    return completion.choices[0].message.content?.trim() || 'SELECT 1;';
  }

  private async executeQuery(sqlQuery: string): Promise<any[]> {
    // Validaciones de seguridad
    if (!this.isSafeQuery(sqlQuery)) {
      throw new Error('Consulta no permitida por seguridad');
    }

    try {
      // Usar Prisma raw query de forma segura
      const result = await prisma.$queryRawUnsafe(sqlQuery);
      return Array.isArray(result) ? result : [result];
    } catch (error) {
      console.error('Error ejecutando SQL:', error);
      throw new Error('Error ejecutando consulta en base de datos');
    }
  }

  private isSafeQuery(sql: string): boolean {
    const forbidden = [
      'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 
      'TRUNCATE', 'EXEC', 'EXECUTE', '--', '/*', '*/', ';--'
    ];
    
    const upperSQL = sql.toUpperCase();
    return !forbidden.some(word => upperSQL.includes(word));
  }

  private async generateResponse(
    originalMessage: string, 
    data: any[], 
    intent: QueryIntent
  ): Promise<ChatbotResponse> {
    const dataPreview = JSON.stringify(data.slice(0, 3), null, 2);
    
    const prompt = `
Genera una respuesta natural y útil basada en:

Pregunta original: "${originalMessage}"
Datos obtenidos: ${dataPreview}
Total de registros: ${data.length}

Responde de forma conversacional, menciona insights relevantes y sugiere acciones.
Máximo 150 palabras.
`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 200
    });

    // Determinar tipo de visualización
    let visualization: 'table' | 'chart' | 'list' | 'card' = 'table';
    if (intent.type === 'count' || intent.type === 'aggregate') {
      visualization = 'chart';
    } else if (data.length === 1) {
      visualization = 'card';
    } else if (data.length <= 5) {
      visualization = 'list';
    }

    return {
      message: completion.choices[0].message.content || 'Aquí están los resultados:',
      data: data,
      visualization,
      suggestions: this.generateSuggestions(intent.entity)
    };
  }

  private generateSuggestions(entity: string): string[] {
    const suggestions = {
      usuarios: [
        'Muéstrame los usuarios administradores',
        'Cuántos usuarios están activos',
        'Lista los usuarios creados esta semana'
      ],
      clientes: [
        'Clientes con más órdenes de compra',
        'Clientes inactivos',
        'Clientes por departamento'
      ],
      ordenes_compra: [
        'Órdenes pendientes de facturación',
        'Ventas de este mes',
        'Órdenes con mayor monto'
      ]
    };

    return suggestions[entity as keyof typeof suggestions] || [
      'Muéstrame un resumen general',
      'Datos de este mes',
      'Estadísticas principales'
    ];
  }
}

export default new ChatbotService();
