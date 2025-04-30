// src/db/prisma.ts
// Cambiar la importación para usar el alias @prisma/client
import { PrismaClient } from '@prisma/client';

// Opcional: Configurar logging si lo deseas
// const prisma = new PrismaClient({
//   log: ['query', 'info', 'warn', 'error'],
// });
const prisma = new PrismaClient();

export default prisma;
