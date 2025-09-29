import { PrismaClient } from '@prisma/client';
import { ContactoTipo, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando el seed de la base de datos...');

  // Limpiar datos existentes (opcional) - orden correcto para evitar errores de clave foránea
  console.log('🧹 Limpiando datos existentes...');
  await prisma.programacionEntrega.deleteMany();
  await prisma.costoAdicionalOp.deleteMany();
  await prisma.historialModificacionesOp.deleteMany();
  await prisma.gestionCobranza.deleteMany();
  await prisma.facturacion.deleteMany();
  await prisma.pagoTransporteAsignado.deleteMany();
  await prisma.transporteAsignado.deleteMany();
  await prisma.pagoOrdenProveedor.deleteMany();
  await prisma.pagoOrdenCompraPrivada.deleteMany();
  await prisma.opProducto.deleteMany();
  await prisma.ordenProveedor.deleteMany();
  await prisma.ordenCompraPrivada.deleteMany();
  await prisma.ordenCompraAgrupada.deleteMany();
  await prisma.agrupacionOrdenCompra.deleteMany();
  await prisma.ordenCompra.deleteMany();
  await prisma.cotizacionProducto.deleteMany();
  await prisma.cotizacion.deleteMany();
  await prisma.stockProducto.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.almacen.deleteMany();
  await prisma.catalogo.deleteMany();
  await prisma.contacto.deleteMany();
  await prisma.cuentaBancaria.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.proveedor.deleteMany();
  await prisma.transporte.deleteMany();
  await prisma.empresa.deleteMany();
  await prisma.usuario.deleteMany();

  // 1. Crear usuarios
  console.log('👤 Creando usuarios...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('jose123', 10);

  const adminPermissions = ['dashboard', 'profile', 'users', 'providers', 'sales', 'treasury', 'companies', 'transports', 'provider_orders', 'billing', 'clients', 'quotes', 'tracking', 'collections', 'jefecobranzas'];
  const userPermissions = ['dashboard', 'profile', 'providers', 'sales', 'clients', 'quotes'];

  const usuarios = await Promise.all([
    prisma.usuario.create({
      data: {
        nombre: 'Harold Administrador',
        email: 'admin@multilimpsac.com',
        password: adminPassword,
        role: Role.ADMIN,
        estado: true,
        permisos: adminPermissions,
      },
    }),
    prisma.usuario.create({
      data: {
        nombre: 'José Cimark',
        email: 'jose@cimark.pe',
        password: userPassword,
        role: Role.ADMIN,
        estado: true,
        permisos: adminPermissions,
      },
    }),
  ]);

  // 2. Crear empresas
  console.log('🏢 Creando empresas...');
  const empresas = await Promise.all([
    prisma.empresa.create({
      data: {
        razonSocial: 'MULTILIMPSAC EMPRESA PRINCIPAL',
        ruc: '20123456789',
        direccion: 'Av. Principal 123, Lima',
        telefono: '+51 999 123 456',
        email: 'info@multilimpsac.com',
        departamento: 'Lima',
        provincia: 'Lima',
        distrito: 'Miraflores',
        web: 'https://multilimpsac.com',
      },
    }),
    prisma.empresa.create({
      data: {
        razonSocial: 'GRUPO ECOLIMP E.I.R.L.',
        ruc: '20987654321',
        direccion: 'Av. Norte 456, Trujillo',
        telefono: '+51 999 654 321',
        email: 'norte@multilimpsac.com',
        departamento: 'La Libertad',
        provincia: 'Trujillo',
        distrito: 'Trujillo',
      },
    }),
  ]);

  // 3. Crear clientes
  console.log('🏛️ Creando clientes...');
  const clientes = await Promise.all([
    prisma.cliente.create({
      data: {
        razonSocial: 'MINISTERIO DE EDUCACIÓN',
        ruc: '20131370181',
        direccion: 'Av. De la Arqueología, cuadra 2, San Borja',
        telefono: '+51 615 5800',
        email: 'contacto@minedu.gob.pe',
        codigoUnidadEjecutora: 'UE001',
        departamento: 'Lima',
        provincia: 'Lima',
        distrito: 'San Borja',
        estado: true,
      },
    }),
    prisma.cliente.create({
      data: {
        razonSocial: 'HOSPITAL NACIONAL DOS DE MAYO',
        ruc: '20131370145',
        direccion: 'Av. Grau cuadra 13, Cercado de Lima',
        telefono: '+51 328 0028',
        email: 'info@hdosdemayo.gob.pe',
        codigoUnidadEjecutora: 'UE002',
        departamento: 'Lima',
        provincia: 'Lima',
        distrito: 'Cercado de Lima',
        estado: true,
      },
    }),
    prisma.cliente.create({
      data: {
        razonSocial: 'EMPRESA PRIVADA XYZ S.A.C.',
        ruc: '20601234567',
        direccion: 'Av. Javier Prado 2050, San Isidro',
        telefono: '+51 999 888 777',
        email: 'compras@empresaxyz.com',
        departamento: 'Lima',
        provincia: 'Lima',
        distrito: 'San Isidro',
        estado: true,
      },
    }),
  ]);

  // 4. Crear proveedores
  console.log('🏭 Creando proveedores...');
  const proveedores = await Promise.all([
    prisma.proveedor.create({
      data: {
        razonSocial: 'PRODUCTOS DE LIMPIEZA PERU S.A.C.',
        ruc: '20456789123',
        direccion: 'Av. Industrial 789, Villa El Salvador',
        telefono: '+51 287 4561',
        email: 'ventas@productoslimpieza.com',
        departamento: 'Lima',
        provincia: 'Lima',
        distrito: 'Villa El Salvador',
        estado: true,
      },
    }),
    prisma.proveedor.create({
      data: {
        razonSocial: 'SUMINISTROS MEDICOS ALPHA E.I.R.L.',
        ruc: '20789456123',
        direccion: 'Jr. Lampa 1234, Cercado de Lima',
        telefono: '+51 426 7890',
        email: 'info@suministrosalpha.com',
        departamento: 'Lima',
        provincia: 'Lima',
        distrito: 'Cercado de Lima',
        estado: true,
      },
    }),
  ]);

  // 5. Crear transportes
  console.log('🚛 Creando empresas de transporte...');
  const transportes = await Promise.all([
    prisma.transporte.create({
      data: {
        razonSocial: 'TRANSPORTES RAPIDOS S.A.C.',
        ruc: '20147258369',
        direccion: 'Av. Argentina 2580, Callao',
        telefono: '+51 464 7890',
        email: 'operaciones@transportesrapidos.com',
        departamento: 'Callao',
        provincia: 'Callao',
        distrito: 'Callao',
        estado: true,
      },
    }),
    prisma.transporte.create({
      data: {
        razonSocial: 'LOGISTICA NACIONAL E.I.R.L.',
        ruc: '20963852741',
        direccion: 'Av. Panamericana Norte Km 10, Los Olivos',
        telefono: '+51 789 1234',
        email: 'contacto@logisticanacional.com',
        departamento: 'Lima',
        provincia: 'Lima',
        distrito: 'Los Olivos',
        estado: true,
      },
    }),
  ]);

  // 6. Crear contactos
  console.log('📞 Creando contactos...');
  const contactos = await Promise.all([
    // Contactos de clientes
    prisma.contacto.create({
      data: {
        nombre: 'María Rodriguez',
        telefono: '+51 999 111 222',
        email: 'maria.rodriguez@minedu.gob.pe',
        tipo: ContactoTipo.CLIENTE,
        referenciaId: clientes[0].id,
        clienteId: clientes[0].id,
        cargo: 'Jefe de Compras',
      },
    }),
    prisma.contacto.create({
      data: {
        nombre: 'José Hernández',
        telefono: '+51 999 333 444',
        email: 'jose.hernandez@hdosdemayo.gob.pe',
        tipo: ContactoTipo.CLIENTE,
        referenciaId: clientes[1].id,
        clienteId: clientes[1].id,
        cargo: 'Coordinador de Logística',
      },
    }),
    // Contactos de proveedores
    prisma.contacto.create({
      data: {
        nombre: 'Ana Pérez',
        telefono: '+51 999 555 666',
        email: 'ana.perez@productoslimpieza.com',
        tipo: ContactoTipo.PROVEEDOR,
        referenciaId: proveedores[0].id,
        proveedorId: proveedores[0].id,
        cargo: 'Gerente de Ventas',
      },
    }),
    prisma.contacto.create({
      data: {
        nombre: 'Luis Mendoza',
        telefono: '+51 999 777 888',
        email: 'luis.mendoza@suministrosalpha.com',
        tipo: ContactoTipo.PROVEEDOR,
        referenciaId: proveedores[1].id,
        proveedorId: proveedores[1].id,
        cargo: 'Ejecutivo Comercial',
      },
    }),
    // Contactos de transportes
    prisma.contacto.create({
      data: {
        nombre: 'Roberto Silva',
        telefono: '+51 999 999 000',
        email: 'roberto.silva@transportesrapidos.com',
        tipo: ContactoTipo.TRANSPORTE,
        referenciaId: transportes[0].id,
        transporteId: transportes[0].id,
        cargo: 'Coordinador de Operaciones',
      },
    }),
  ]);

  // 7. Crear catálogos
  console.log('📋 Creando catálogos...');
  const catalogos = await Promise.all([
    prisma.catalogo.create({
      data: {
        nombre: 'Productos de Limpieza Institucional',
        descripcion: 'Catálogo de productos de limpieza para instituciones públicas',
        empresaId: empresas[0].id,
      },
    }),
    prisma.catalogo.create({
      data: {
        nombre: 'Suministros Médicos Básicos',
        descripcion: 'Catálogo de insumos médicos y de primeros auxilios',
        empresaId: empresas[0].id,
      },
    }),
  ]);

  console.log('✅ Seed completado exitosamente!');
  console.log('\n📊 Datos creados:');
  console.log(`- ${usuarios.length} usuarios`);
  console.log(`- ${empresas.length} empresas`);
  console.log(`- ${clientes.length} clientes`);
  console.log(`- ${proveedores.length} proveedores`);
  console.log(`- ${transportes.length} empresas de transporte`);
  console.log(`- ${contactos.length} contactos`);
  console.log(`- ${catalogos.length} catálogos`);
  console.log('- 4 productos de órdenes de proveedor');
  console.log('- 2 transportes asignados');
  console.log('- 2 gestiones de cobranza');
  console.log('- 1 facturación');
  console.log('- 2 programaciones de entrega');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
