// src/graphql/resolvers/scalar.resolver.ts
import { GraphQLScalarType, Kind } from 'graphql';
import logger from '../../shared/config/logger';

// Resolver personalizado para el tipo escalar JSON
export const jsonScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'Tipo escalar personalizado para representar valores JSON',
  
  // Serializar valores al salir hacia el cliente
  serialize(value: any): any {
    // Simplemente pasar el valor tal como está, ya debe ser JSON válido
    return value;
  },
  
  // Procesar valores de entrada en variables o argumentos
  parseValue(value: any): any {
    try {
      // Si es un string, intentamos parsearlo
      if (typeof value === 'string') {
        return JSON.parse(value);
      }
      // De lo contrario, devolvemos el valor como está
      return value;
    } catch (error) {
      logger.error(`Error al parsear valor JSON: ${error}`);
      throw new Error(`No se pudo analizar el valor como JSON: ${error}`);
    }
  },
  
  // Procesar valores literales en el documento de consulta
  parseLiteral(ast: any): any {
    switch (ast.kind) {
      case Kind.STRING:
        try {
          return JSON.parse(ast.value);
        } catch (e) {
          return ast.value; // Devolver como string si no se puede parsear
        }
      case Kind.OBJECT:
        return ast.fields.reduce((obj: any, field: any) => {
          obj[field.name.value] = parseLiteral(field.value);
          return obj;
        }, {});
      case Kind.LIST:
        return ast.values.map(parseLiteral);
      case Kind.INT:
        return parseInt(ast.value, 10);
      case Kind.FLOAT:
        return parseFloat(ast.value);
      case Kind.BOOLEAN:
        return ast.value === 'true';
      default:
        return null;
    }
  }
});

// Función auxiliar para parsear literales en objetos anidados
function parseLiteral(ast: any): any {
  switch (ast.kind) {
    case Kind.STRING:
      return ast.value;
    case Kind.INT:
      return parseInt(ast.value, 10);
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.BOOLEAN:
      return ast.value === 'true';
    case Kind.OBJECT:
      return ast.fields.reduce((obj: any, field: any) => {
        obj[field.name.value] = parseLiteral(field.value);
        return obj;
      }, {});
    case Kind.LIST:
      return ast.values.map(parseLiteral);
    default:
      return null;
  }
}
