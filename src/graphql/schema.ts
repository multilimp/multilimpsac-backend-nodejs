import { buildSchema } from 'graphql';
import fs from 'fs';
import path from 'path';
import { ordenCompraResolvers } from './resolvers/ordenCompra.resolver';

// Leer el contenido del archivo .graphql
const schemaString = fs.readFileSync(path.join(__dirname, 'OrdenCompraType.graphql'), 'utf-8');

// Construir el esquema GraphQL
export const schema = buildSchema(schemaString);

// Combinar todos los resolvers
// Por ahora solo tenemos ordenCompraResolvers, pero aquí podrías añadir más
export const rootValue = {
  ...ordenCompraResolvers.Query,
  // Si tienes Mutations, las añadirías aquí también
  // ...ordenCompraResolvers.Mutation,
  // Si tienes resolvers a nivel de tipo (como el ejemplo comentado en ordenCompra.resolver.ts),
  // se manejarían de forma diferente o se asegurarían de que graphql-tools o similar los recoja.
  // Para express-graphql con `rootValue`, nos enfocamos en Query y Mutation.
  // Los resolvers a nivel de campo para tipos como OrdenCompra.cliente se resuelven automáticamente
  // si el campo existe en el objeto padre o si Prisma los incluye gracias a `getIncludes`.
};
