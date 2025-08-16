export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: string;
    sqlQuery?: string;
    executionTime?: number;
    resultCount?: number;
  };
}

export interface QueryIntent {
  type: 'list' | 'count' | 'filter' | 'aggregate' | 'create' | 'update' | 'delete';
  entity: 'usuarios' | 'clientes' | 'proveedores' | 'ordenes_compra' | 'productos' | 'contactos';
  filters?: Record<string, any>;
  limit?: number;
  orderBy?: string;
}

export interface DatabaseSchema {
  tables: {
    [tableName: string]: {
      columns: {
        [columnName: string]: {
          type: string;
          nullable: boolean;
          description: string;
        };
      };
      relationships: {
        [relationName: string]: {
          table: string;
          type: 'one-to-one' | 'one-to-many' | 'many-to-many';
        };
      };
    };
  };
}

export interface ChatbotResponse {
  message: string;
  data?: any[];
  visualization?: 'table' | 'chart' | 'list' | 'card';
  suggestions?: string[];
}
