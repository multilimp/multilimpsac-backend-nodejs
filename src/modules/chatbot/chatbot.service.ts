import prisma from '../../database/prisma';
import { ChatMessage, QueryIntent, ChatbotResponse, DatabaseSchema } from './chatbot.types';
import { GeminiService } from '../../shared/services/gemini.service';

class ChatbotService {
  private geminiService: GeminiService;
  private schema: DatabaseSchema = { tables: {} };

  constructor() {
    this.geminiService = new GeminiService();
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
            razon_social: { type: 'string', nullable: false, description: 'Razón social del cliente' },
            ruc: { type: 'string', nullable: false, description: 'RUC del cliente' },
            email: { type: 'string', nullable: true, description: 'Email de contacto' },
            estado: { type: 'boolean', nullable: false, description: 'Estado activo/inactivo' },
            codigo_unidad_ejecutora: { type: 'string', nullable: true, description: 'Código de unidad ejecutora' },
            departamento: { type: 'string', nullable: true, description: 'Departamento' },
            provincia: { type: 'string', nullable: true, description: 'Provincia' },
            distrito: { type: 'string', nullable: true, description: 'Distrito' }
          },
          relationships: {
            ordenesCompra: { table: 'ordenes_compra', type: 'one-to-many' },
            contactos: { table: 'contactos', type: 'one-to-many' }
          }
        },
        proveedores: {
          columns: {
            id: { type: 'number', nullable: false, description: 'ID único del proveedor' },
            razon_social: { type: 'string', nullable: false, description: 'Razón social del proveedor' },
            ruc: { type: 'string', nullable: false, description: 'RUC del proveedor' },
            email: { type: 'string', nullable: true, description: 'Email de contacto' },
            estado: { type: 'boolean', nullable: false, description: 'Estado activo/inactivo' },
            departamento: { type: 'string', nullable: true, description: 'Departamento' },
            provincia: { type: 'string', nullable: true, description: 'Provincia' },
            distrito: { type: 'string', nullable: true, description: 'Distrito' }
          },
          relationships: {
            ordenesProveedor: { table: 'ordenes_proveedor', type: 'one-to-many' },
            contactos: { table: 'contactos', type: 'one-to-many' }
          }
        },
        ordenes_compra: {
          columns: {
            id: { type: 'number', nullable: false, description: 'ID único de la orden' },
            codigo_venta: { type: 'string', nullable: false, description: 'Código de venta único' },
            fecha_emision: { type: 'date', nullable: true, description: 'Fecha de emisión' },
            monto_venta: { type: 'decimal', nullable: true, description: 'Monto total de venta' },
            etapa_actual: { type: 'string', nullable: false, description: 'Etapa actual del proceso' },
            estado_venta: { type: 'string', nullable: false, description: 'Estado de la venta' }
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

    try {
      const content = await this.geminiService.generateTextContent(prompt, {
        temperature: 0.1,
        maxOutputTokens: 200,
        responseMimeType: "application/json"
      });
      
      return JSON.parse(content);
    } catch (error) {
      console.error('Error analizando intención:', error);
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
2. Usa nombres de tabla y columna EXACTOS del schema (snake_case en BD)
3. Para clientes usa: razon_social, codigo_unidad_ejecutora (NO razonSocial)
4. Para proveedores usa: razon_social (NO razonSocial)
5. Para ordenes_compra usa: codigo_venta, fecha_emision, monto_venta, etapa_actual
6. Incluye LIMIT para evitar consultas masivas (máximo 50)
7. Responde SOLO con la consulta SQL pura, sin bloques de código markdown
8. NO uses backticks ni bloques de código en tu respuesta
9. NO agregues explicaciones adicionales

Ejemplo de respuesta (solo el SQL):
SELECT id, nombre, email, role FROM usuarios WHERE estado = true LIMIT 10;
`;

    try {
      const content = await this.geminiService.generateTextContent(prompt, {
        temperature: 0,
        maxOutputTokens: 300
      });
      
      // Limpiar la respuesta de Gemini removiendo bloques de código markdown
      let cleanSQL = content.trim();
      
      // Remover bloques de código SQL (```sql ... ``` o ``` ... ```)
      cleanSQL = cleanSQL.replace(/```sql\n?/gi, '');
      cleanSQL = cleanSQL.replace(/```\n?/g, '');
      
      // Remover espacios extra y saltos de línea al inicio/final
      cleanSQL = cleanSQL.trim();
      
      // Si está vacío, devolver consulta por defecto
      return cleanSQL || 'SELECT 1;';
    } catch (error) {
      console.error('Error generando SQL:', error);
      return 'SELECT 1;';
    }
  }

  private async executeQuery(sqlQuery: string): Promise<any[]> {
    // Validaciones de seguridad
    if (!this.isSafeQuery(sqlQuery)) {
      throw new Error('Consulta no permitida por seguridad');
    }

    try {
      // Usar Prisma raw query de forma segura
      const result = await prisma.$queryRawUnsafe(sqlQuery);
      const arrayResult = Array.isArray(result) ? result : [result];
      
      // Convertir BigInt a string para evitar errores de serialización
      return this.convertBigIntToString(arrayResult);
    } catch (error) {
      console.error('Error ejecutando SQL:', error);
      throw new Error('Error ejecutando consulta en base de datos');
    }
  }

  private convertBigIntToString(data: any[]): any[] {
    return data.map(row => {
      const convertedRow: any = {};
      for (const [key, value] of Object.entries(row)) {
        if (typeof value === 'bigint') {
          convertedRow[key] = value.toString();
        } else {
          convertedRow[key] = value;
        }
      }
      return convertedRow;
    });
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

    try {
      const content = await this.geminiService.generateTextContent(prompt, {
        temperature: 0.7,
        maxOutputTokens: 200
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
        message: content || 'Aquí están los resultados:',
        data: data,
        visualization,
        suggestions: this.generateSuggestions(intent.entity)
      };
    } catch (error) {
      console.error('Error generando respuesta:', error);
      
      // Fallback response
      let visualization: 'table' | 'chart' | 'list' | 'card' = 'table';
      if (intent.type === 'count' || intent.type === 'aggregate') {
        visualization = 'chart';
      } else if (data.length === 1) {
        visualization = 'card';
      } else if (data.length <= 5) {
        visualization = 'list';
      }

      return {
        message: `Encontré ${data.length} resultado${data.length !== 1 ? 's' : ''} para tu consulta.`,
        data: data,
        visualization,
        suggestions: this.generateSuggestions(intent.entity)
      };
    }
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
