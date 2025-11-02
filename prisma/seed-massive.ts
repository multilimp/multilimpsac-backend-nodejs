import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { ContactoTipo } from '@prisma/client';

const prisma = new PrismaClient();

const CONFIG = {
  EMPRESAS: 5,
  CLIENTES: 1000,
  PROVEEDORES: 300,
  TRANSPORTES: 50,
  PRODUCTOS: 2000,
  CONTACTOS_POR_ENTIDAD: 2,
  BATCH_SIZE: 50,
};

const generatePeruvianRUC = (): string => {
  const prefix = faker.helpers.arrayElement(['20', '10']);
  const numbers = faker.string.numeric(9);
  return prefix + numbers;
};

const generatePeruvianPhone = (): string => {
  const prefix = faker.helpers.arrayElement(['+51 9', '+51 1']);
  const numbers = faker.string.numeric(8);
  return prefix + numbers;
};

const peruDepartments = [
  'Lima', 'Arequipa', 'Cusco', 'La Libertad', 'Piura', 'Lambayeque',
  'Junín', 'Cajamarca', 'Ica', 'Huánuco', 'Ancash', 'Loreto'
];

const peruProvinces: Record<string, string[]> = {
  'Lima': ['Lima', 'Cañete', 'Huaura'],
  'Arequipa': ['Arequipa', 'Camaná', 'Islay'],
  'Cusco': ['Cusco', 'Urubamba', 'Calca'],
  'La Libertad': ['Trujillo', 'Chepén', 'Pacasmayo'],
  'Piura': ['Piura', 'Sullana', 'Talara'],
  'Lambayeque': ['Chiclayo', 'Lambayeque', 'Ferreñafe']
};

const peruDistricts: Record<string, string[]> = {
  'Lima': ['Miraflores', 'San Isidro', 'Surco', 'La Molina', 'Barranco'],
  'Arequipa': ['Cercado', 'Cayma', 'Yanahuara'],
  'Cusco': ['Cusco', 'San Blas', 'San Sebastián'],
  'Trujillo': ['Trujillo', 'La Esperanza', 'El Porvenir']
};

async function insertInBatches<T>(
  data: T[],
  insertFn: (batch: T[]) => Promise<any>,
  batchSize: number = CONFIG.BATCH_SIZE
): Promise<any[]> {
  const results = [];
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    console.log(`  📦 Insertando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(data.length / batchSize)} (${batch.length} registros)`);
    const result = await insertFn(batch);
    results.push(...(Array.isArray(result) ? result : [result]));
  }
  return results;
}

function generateEmpresaData() {
  const dept = faker.helpers.arrayElement(peruDepartments);
  const prov = faker.helpers.arrayElement(peruProvinces[dept] || [dept]);
  const dist = faker.helpers.arrayElement(peruDistricts[prov] || [prov]);

  return {
    razonSocial: faker.company.name().toUpperCase() + ' ' + faker.helpers.arrayElement(['S.A.C.', 'E.I.R.L.', 'S.R.L.']),
    ruc: generatePeruvianRUC(),
    direccion: faker.location.streetAddress(),
    telefono: generatePeruvianPhone(),
    email: faker.internet.email(),
    departamento: dept,
    provincia: prov,
    distrito: dist,
    web: faker.internet.url(),
  };
}

function generateClienteData() {
  const dept = faker.helpers.arrayElement(peruDepartments);
  const prov = faker.helpers.arrayElement(peruProvinces[dept] || [dept]);
  const dist = faker.helpers.arrayElement(peruDistricts[prov] || [prov]);

  return {
    razonSocial: faker.company.name().toUpperCase() + ' ' + faker.helpers.arrayElement(['S.A.', 'S.A.C.', 'E.I.R.L.', 'S.R.L.']),
    ruc: generatePeruvianRUC(),
    direccion: faker.location.streetAddress(),
    telefono: generatePeruvianPhone(),
    email: faker.internet.email(),
    departamento: dept,
    provincia: prov,
    distrito: dist,
    sede: faker.helpers.arrayElement(['Principal', 'Sucursal Norte', 'Sucursal Sur', 'Almacén Central']),
    promedioCobranza: faker.number.float({ min: 15, max: 90, fractionDigits: 2 }),
    codigoUnidadEjecutora: faker.string.alphanumeric(10).toUpperCase(),
  };
}

function generateProveedorData() {
  const dept = faker.helpers.arrayElement(peruDepartments);
  const prov = faker.helpers.arrayElement(peruProvinces[dept] || [dept]);
  const dist = faker.helpers.arrayElement(peruDistricts[prov] || [prov]);

  return {
    razonSocial: faker.company.name().toUpperCase() + ' ' + faker.helpers.arrayElement(['S.A.C.', 'E.I.R.L.', 'S.R.L.']),
    ruc: generatePeruvianRUC(),
    direccion: faker.location.streetAddress(),
    telefono: generatePeruvianPhone(),
    email: faker.internet.email(),
    departamento: dept,
    provincia: prov,
    distrito: dist,
  };
}

function generateTransporteData() {
  const dept = faker.helpers.arrayElement(peruDepartments);
  const prov = faker.helpers.arrayElement(peruProvinces[dept] || [dept]);
  const dist = faker.helpers.arrayElement(peruDistricts[prov] || [prov]);

  return {
    razonSocial: 'TRANSPORTES ' + faker.company.name().toUpperCase() + ' ' + faker.helpers.arrayElement(['S.A.C.', 'E.I.R.L.']),
    ruc: generatePeruvianRUC(),
    direccion: faker.location.streetAddress(),
    telefono: generatePeruvianPhone(),
    email: faker.internet.email(),
    departamento: dept,
    provincia: prov,
    distrito: dist,
    cobertura: faker.helpers.arrayElements(peruDepartments, { min: 2, max: 5 }).join(', '),
  };
}

function generateContactoData(referenciaId: number, tipo: ContactoTipo) {
  return {
    nombre: faker.person.fullName(),
    telefono: generatePeruvianPhone(),
    email: faker.internet.email(),
    tipo,
    referenciaId,
    cargo: faker.person.jobTitle(),
    cumpleanos: faker.date.birthdate({ min: 25, max: 65, mode: 'age' }),
    nota: faker.lorem.sentence(),
    usuarioDestacado: faker.datatype.boolean(0.3),
  };
}



async function main() {
  console.log('🚀 Iniciando seeding masivo de la base de datos...');
  console.log(`📊 Configuración: ${CONFIG.CLIENTES} clientes, ${CONFIG.PROVEEDORES} proveedores, ${CONFIG.PRODUCTOS} productos`);

  const startTime = Date.now();

  try {
    console.log('\n🏢 Creando empresas...');
    const empresasData = Array.from({ length: CONFIG.EMPRESAS }, generateEmpresaData);
    const empresas = await insertInBatches(
      empresasData,
      async (batch) => {
        const results = [];
        for (const empresa of batch) {
          const result = await prisma.empresa.create({ data: empresa });
          results.push(result);
        }
        return results;
      }
    );

    console.log('\n👥 Creando clientes...');
    const clientesData = Array.from({ length: CONFIG.CLIENTES }, generateClienteData);
    const clientes = await insertInBatches(
      clientesData,
      async (batch) => {
        const results = [];
        for (const cliente of batch) {
          const result = await prisma.cliente.create({ data: cliente });
          results.push(result);
        }
        return results;
      }
    );

    console.log('\n🏭 Creando proveedores...');
    const proveedoresData = Array.from({ length: CONFIG.PROVEEDORES }, generateProveedorData);
    const proveedores = await insertInBatches(
      proveedoresData,
      async (batch) => {
        const results = [];
        for (const proveedor of batch) {
          const result = await prisma.proveedor.create({ data: proveedor });
          results.push(result);
        }
        return results;
      }
    );

    console.log('\n🚛 Creando transportes...');
    const transportesData = Array.from({ length: CONFIG.TRANSPORTES }, generateTransporteData);
    const transportes = await insertInBatches(
      transportesData,
      async (batch) => {
        const results = [];
        for (const transporte of batch) {
          const result = await prisma.transporte.create({ data: transporte });
          results.push(result);
        }
        return results;
      }
    );

    console.log('\n📞 Creando contactos para clientes...');
    const contactosClientesData = clientes.flatMap(cliente =>
      Array.from({ length: CONFIG.CONTACTOS_POR_ENTIDAD }, () => ({
        ...generateContactoData(cliente.id, ContactoTipo.CLIENTE),
        clienteId: cliente.id,
      }))
    );
    await insertInBatches(
      contactosClientesData,
      async (batch) => {
        const results = [];
        for (const contacto of batch) {
          const result = await prisma.contacto.create({ data: contacto });
          results.push(result);
        }
        return results;
      }
    );

    console.log('\n📞 Creando contactos para proveedores...');
    const contactosProveedoresData = proveedores.flatMap(proveedor =>
      Array.from({ length: CONFIG.CONTACTOS_POR_ENTIDAD }, () => ({
        ...generateContactoData(proveedor.id, ContactoTipo.PROVEEDOR),
        proveedorId: proveedor.id,
      }))
    );
    await insertInBatches(
      contactosProveedoresData,
      async (batch) => {
        const results = [];
        for (const contacto of batch) {
          const result = await prisma.contacto.create({ data: contacto });
          results.push(result);
        }
        return results;
      }
    );

    console.log('\n📦 Creando almacenes...');
    const almacenesData = Array.from({ length: 50 }, () => ({
      nombre: `Almacén ${faker.company.name()}`,
      direccion: faker.location.streetAddress(),
      ciudad: faker.helpers.arrayElement(['Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura']),
    }));
    const almacenes = await insertInBatches(
      almacenesData,
      async (batch) => {
        const results = [];
        for (const almacen of batch) {
          const result = await prisma.almacen.create({ data: almacen });
          results.push(result);
        }
        return results;
      }
    );

    console.log('\n🛍️ Creando productos...');
    const productosData = Array.from({ length: CONFIG.PRODUCTOS }, () => ({
      nombre: faker.commerce.productName(),
      descripcion: faker.commerce.productDescription(),
      unidadMedida: faker.helpers.arrayElement(['LT', 'KG', 'GL', 'UND', 'CJ', 'RL']),
      precioBase: faker.number.float({ min: 10, max: 500, fractionDigits: 2 }),
      estado: true,
    }));
    const productos = await insertInBatches(
      productosData,
      async (batch) => {
        const results = [];
        for (const producto of batch) {
          const result = await prisma.producto.create({ data: producto });
          results.push(result);
        }
        return results;
      }
    );

    console.log('\n📊 Creando stock para productos...');
    const stockData = [];
    for (const producto of productos) {
      const numAlmacenes = faker.number.int({ min: 1, max: 3 });
      const almacenesSeleccionados = faker.helpers.arrayElements(almacenes, numAlmacenes);
      
      for (const almacen of almacenesSeleccionados) {
        stockData.push({
          productoId: producto.id,
          almacenId: almacen.id,
          cantidad: faker.number.int({ min: 0, max: 1000 }),
        });
      }
    }
    await insertInBatches(
      stockData,
      async (batch) => {
        const results = [];
        for (const stock of batch) {
          const result = await prisma.stockProducto.create({ data: stock });
          results.push(result);
        }
        return results;
      }
    );

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log('\n✅ Seeding masivo completado exitosamente!');
    console.log(`⏱️  Tiempo total: ${duration.toFixed(2)} segundos`);
    console.log('\n📈 Resumen de registros creados:');
    console.log(`   🏢 Empresas: ${empresas.length}`);
    console.log(`   👥 Clientes: ${clientes.length}`);
    console.log(`   🏭 Proveedores: ${proveedores.length}`);
    console.log(`   🚛 Transportes: ${transportes.length}`);
    console.log(`   📞 Contactos: ${contactosClientesData.length + contactosProveedoresData.length}`);
    console.log(`   📦 Almacenes: ${almacenes.length}`);
    console.log(`   🛍️  Productos: ${productos.length}`);
    console.log(`   📊 Stock: ${stockData.length}`);

  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error fatal:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });