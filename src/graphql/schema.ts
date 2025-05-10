// src/graphql/schema.ts
import fs from 'fs';
import path from 'path';
import { ordenCompraResolvers } from './resolvers/ordenCompra.resolver';

export const typeDefs = fs.readFileSync(
  path.join(__dirname, './OrdenCompraType.graphql'),
  'utf8'
);

export const resolvers = {
  Query: {
    ...ordenCompraResolvers.Query,
  },
  // Mutation: { ...ordenCompraResolvers.Mutation }
};
