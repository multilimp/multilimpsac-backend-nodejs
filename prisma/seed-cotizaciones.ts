import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { CotizacionEstado, TipoPago } from '@prisma/client';

const prisma = new PrismaClient();

const CONFIG = {
  COTIZACIONES: 1000,
  PRODUCTOS_POR_COTIZACION: 5,
  BATCH_SIZE: 25,
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

let cotizacionCounter = 1;
function generateCotizacionCode(): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const sequential = String(cotizacionCounter++).padStart(4, '0');
  return `COT-${year}${month}-${sequential}`;
}

async function main() {
  console.log('🚀 Iniciando seeding de cotizaciones...');
  
  const startTime = Date.now();

  try {
    // Limpiar datos existentes
    console.log('🧹 Limpiando cotizaciones existentes...');
    await prisma.cotizacionProducto.deleteMany();
    await prisma.cotizacion.deleteMany();
    
    // Obtener datos existentes
    console.log('📊 Obteniendo datos existentes...');
    const empresas = await prisma.empresa.findMany();
    const clientes = await prisma.cliente.findMany();
    const contactosClientes = await prisma.contacto.findMany({
      where: { tipo: 'CLIENTE' }
    });
    const productos = await prisma.producto.findMany();

    if (empresas.length === 0 || clientes.length === 0 || productos.length === 0) {
      console.error('❌ No hay datos base suficientes. Ejecuta primero el seed-massive.ts');
      return;
    }

    console.log(`📈 Datos disponibles: ${empresas.length} empresas, ${clientes.length} clientes, ${productos.length} productos`);

    // Generar cotizaciones
    console.log('\n💰 Creando cotizaciones...');
    const cotizacionesData = Array.from({ length: CONFIG.COTIZACIONES }, () => {
      const empresa = faker.helpers.arrayElement(empresas);
      const cliente = faker.helpers.arrayElement(clientes);
      const contactosDelCliente = contactosClientes.filter(c => c.clienteId === cliente.id);
      const contacto = contactosDelCliente.length > 0 
        ? faker.helpers.arrayElement(contactosDelCliente)
        : null;

      return {
        codigoCotizacion: generateCotizacionCode(),
        empresaId: empresa.id,
        clienteId: cliente.id,
        contactoClienteId: contacto?.id || null,
        montoTotal: faker.number.float({ min: 500, max: 50000, fractionDigits: 2 }),
        tipoPago: faker.helpers.arrayElement(Object.values(TipoPago)),
        notaPago: faker.lorem.sentence(),
        notaPedido: faker.lorem.paragraph(),
        direccionEntrega: faker.location.streetAddress(),
        distritoEntrega: faker.location.city(),
        provinciaEntrega: faker.location.state(),
        departamentoEntrega: faker.location.state(),
        referenciaEntrega: faker.lorem.sentence(),
        estado: faker.helpers.arrayElement(Object.values(CotizacionEstado)),
        fechaCotizacion: faker.date.between({ 
          from: new Date('2024-01-01'), 
          to: new Date() 
        }),
        fechaEntrega: faker.date.future({ years: 0.5 }),
      };
    });

    const cotizaciones = await insertInBatches(
      cotizacionesData,
      async (batch) => {
        const results = [];
        for (const cotizacion of batch) {
          const result = await prisma.cotizacion.create({ data: cotizacion });
          results.push(result);
        }
        return results;
      }
    );

    // Generar productos para cotizaciones
    console.log('\n🛍️ Agregando productos a cotizaciones...');
    const cotizacionProductosData = [];
    
    for (const cotizacion of cotizaciones) {
      const numProductos = faker.number.int({ 
        min: 2, 
        max: CONFIG.PRODUCTOS_POR_COTIZACION 
      });
      const productosSeleccionados = faker.helpers.arrayElements(
        productos, 
        numProductos
      );

      for (const producto of productosSeleccionados) {
        const cantidad = faker.number.int({ min: 1, max: 100 });
        const precioUnitario = faker.number.float({ 
          min: 10, 
          max: 1000, 
          fractionDigits: 2 
        });
        const total = cantidad * precioUnitario;

        cotizacionProductosData.push({
          codigo: `PROD-${faker.string.alphanumeric(6).toUpperCase()}`,
          descripcion: producto.descripcion || producto.nombre,
          unidadMedida: producto.unidadMedida || 'UND',
          cantidad,
          cantidadAlmacen: faker.number.int({ min: 0, max: cantidad }),
          cantidadTotal: cantidad,
          precioUnitario,
          total,
          cotizacionId: cotizacion.id,
          cantidadCliente: cantidad,
        });
      }
    }

    await insertInBatches(
      cotizacionProductosData,
      async (batch) => {
        const results = [];
        for (const item of batch) {
          const result = await prisma.cotizacionProducto.create({ data: item });
          results.push(result);
        }
        return results;
      }
    );

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log('\n✅ Seeding de cotizaciones completado!');
    console.log(`⏱️  Tiempo total: ${duration.toFixed(2)} segundos`);
    console.log('\n📈 Resumen de registros creados:');
    console.log(`   💰 Cotizaciones: ${cotizaciones.length}`);
    console.log(`   🛍️  Productos en cotizaciones: ${cotizacionProductosData.length}`);

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