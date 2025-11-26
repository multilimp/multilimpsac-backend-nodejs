import 'dotenv/config'
import { PrismaClient, Role } from './generated/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Iniciando el seed de la base de datos...');

  // Verificar si José ya existe
  const existingUser = await prisma.usuario.findUnique({
    where: { email: 'jose@cimark.pe' }
  });

  if (existingUser) {
    console.log('✅ El usuario José ya existe, no se creará de nuevo.');
    return;
  }

  // Crear usuario José
  console.log('👤 Creando usuario José...');
  const userPassword = await bcrypt.hash('jose123', 10);

  const allPermissions = [
    'dashboard',
    'profile',
    'users',
    'providers',
    'sales',
    'treasury',
    'companies',
    'transports',
    'provider_orders',
    'billing',
    'clients',
    'quotes',
    'tracking',
    'collections',
    'jefecobranzas'
  ];

  const jose = await prisma.usuario.create({
    data: {
      nombre: 'José Cimark',
      email: 'jose@cimark.pe',
      password: userPassword,
      role: Role.ADMIN,
      estado: true,
      permisos: allPermissions,
    },
  });

  console.log('✅ Seed completado exitosamente!');
  console.log('\n📊 Usuario creado:');
  console.log(`- ID: ${jose.id}`);
  console.log(`- Nombre: ${jose.nombre}`);
  console.log(`- Email: ${jose.email}`);
  console.log(`- Role: ${jose.role}`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
