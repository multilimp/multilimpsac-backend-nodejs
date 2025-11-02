import { PrismaClient, EstadoRol, EstadoCobranza, EstadoPago, TipoDestino, ContactoTipo } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const CONFIG = {
  ORDENES_COMPRA: 5000,
  ORDENES_PROVEEDOR: 8000,
  PRODUCTOS_POR_ORDEN: { min: 1, max: 8 },
  BATCH_SIZE: 50
};

async function insertInBatches<T>(
  data: T[],
  batchProcessor: (batch: T[]) => Promise<any[]>,
  batchSize: number = CONFIG.BATCH_SIZE
): Promise<void> {
  const totalBatches = Math.ceil(data.length / batchSize);

  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, data.length);
    const batch = data.slice(start, end);

    console.log(`  📦 Insertando lote ${i + 1}/${totalBatches} (${batch.length} registros)`);
    await batchProcessor(batch);
  }
}

let ocCounter = 1;
function generateCodigoVenta(): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const sequential = String(ocCounter++).padStart(6, '0');
  return `OC-${year}${month}-${sequential}`;
}

let opCounter = 1;
function generateCodigoOp(): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const sequential = String(opCounter++).padStart(6, '0');
  return `OP-${year}${month}-${sequential}`;
}

function generatePeruvianAddress() {
  const departamentos = ['Lima', 'Arequipa', 'Cusco', 'Trujillo', 'Chiclayo', 'Piura', 'Iquitos', 'Huancayo', 'Tacna', 'Ica'];
  const provincias = ['Lima', 'Arequipa', 'Cusco', 'Trujillo', 'Chiclayo', 'Piura', 'Maynas', 'Huancayo', 'Tacna', 'Ica'];
  const distritos = ['Miraflores', 'San Isidro', 'Surco', 'La Molina', 'Barranco', 'San Borja', 'Jesús María', 'Magdalena', 'Pueblo Libre', 'Lince'];

  return {
    departamento: faker.helpers.arrayElement(departamentos),
    provincia: faker.helpers.arrayElement(provincias),
    distrito: faker.helpers.arrayElement(distritos),
    direccion: `${faker.location.streetAddress()} ${faker.location.buildingNumber()}`
  };
}

async function seedOrdenesCompra() {
  console.log('🛒 Generando Órdenes de Compra...');

  const empresas = await prisma.empresa.findMany();
  const clientes = await prisma.cliente.findMany();
  const contactos = await prisma.contacto.findMany();

  if (empresas.length === 0 || clientes.length === 0) {
    throw new Error('No hay empresas o clientes disponibles');
  }

  const ordenesData = [];

  for (let i = 0; i < CONFIG.ORDENES_COMPRA; i++) {
    const empresa = faker.helpers.arrayElement(empresas);
    const cliente = faker.helpers.arrayElement(clientes);
    const contactosDelCliente = contactos.filter(c => c.clienteId === cliente.id);
    const contacto = contactosDelCliente.length > 0 ? faker.helpers.arrayElement(contactosDelCliente) : null;
    const address = generatePeruvianAddress();

    const fechaEmision = faker.date.between({
      from: new Date('2024-01-01'),
      to: new Date()
    });

    const fechaEntrega = new Date(fechaEmision.getTime() + faker.number.int({ min: 7, max: 90 }) * 24 * 60 * 60 * 1000);

    ordenesData.push({
      codigoVenta: generateCodigoVenta(),
      fechaEmision,
      empresaId: empresa.id,
      clienteId: cliente.id,
      contactoClienteId: contacto?.id || null,
      ventaPrivada: faker.datatype.boolean({ probability: 0.3 }),
      provinciaEntrega: address.provincia,
      distritoEntrega: address.distrito,
      departamentoEntrega: address.departamento,
      direccionEntrega: address.direccion,
      referenciaEntrega: faker.lorem.sentence(),
      fechaEntrega,
      montoVenta: faker.number.float({ min: 500, max: 100000, fractionDigits: 2 }),
      fechaForm: new Date(fechaEmision.getTime() + 30 * 24 * 60 * 60 * 1000),
      fechaMaxForm: new Date(fechaEmision.getTime() + 60 * 24 * 60 * 60 * 1000),
      siaf: faker.string.alphanumeric(10).toUpperCase(),
      etapaSiaf: faker.helpers.arrayElement(['CERTIFICACION', 'COMPROMISO', 'DEVENGADO', 'GIRADO']),
      fechaSiaf: new Date(fechaEmision.getTime() + 15 * 24 * 60 * 60 * 1000),
      documentoPeruCompras: faker.string.alphanumeric(12).toUpperCase(),
      fechaPeruCompras: new Date(fechaEmision.getTime() + 20 * 24 * 60 * 60 * 1000),
      fechaEntregaOc: fechaEntrega,
      penalidad: faker.datatype.boolean({ probability: 0.1 }) ? faker.number.float({ min: 100, max: 5000, fractionDigits: 2 }) : null,
      netoCobrado: faker.number.float({ min: 400, max: 95000, fractionDigits: 2 }),
      fechaEstadoCobranza: faker.date.recent({ days: 30 }),
      fechaProximaGestion: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      etapaActual: faker.helpers.arrayElement(['creacion', 'aprobacion', 'ejecucion', 'entrega', 'facturacion', 'cobranza']),
      estadoActivo: faker.datatype.boolean({ probability: 0.9 }),
      codigoOcf: faker.string.alphanumeric(8).toUpperCase(),
      estadoCobranza: faker.helpers.arrayElement(Object.values(EstadoCobranza)),
      estadoCobranzaRol: faker.helpers.arrayElement(Object.values(EstadoRol)),
      multipleFuentesFinanciamiento: faker.datatype.boolean({ probability: 0.2 }),
      estadoRolSeguimiento: faker.helpers.arrayElement(Object.values(EstadoRol)),
      estadoVenta: faker.helpers.arrayElement(Object.values(EstadoRol)),
      estadoFacturacion: faker.helpers.arrayElement(Object.values(EstadoRol)),
      cartaCci: faker.datatype.boolean({ probability: 0.4 }) ? faker.string.alphanumeric(10) : null,
      cartaGarantia: faker.datatype.boolean({ probability: 0.3 }) ? faker.string.alphanumeric(10) : null,
      cartaAmpliacion: faker.datatype.boolean({ probability: 0.2 }) ? faker.string.alphanumeric(10) : null
    });
  }

  await insertInBatches(
    ordenesData,
    async (batch) => {
      const results = [];
      for (const orden of batch) {
        const result = await prisma.ordenCompra.create({
          data: orden
        });
        results.push(result);
      }
      return results;
    }
  );

  console.log(`✅ ${CONFIG.ORDENES_COMPRA} Órdenes de Compra creadas`);
}

async function seedOrdenesProveedor() {
  console.log('🏭 Generando Órdenes de Proveedor...');

  const empresas = await prisma.empresa.findMany();
  const proveedores = await prisma.proveedor.findMany();
  const contactos = await prisma.contacto.findMany();
  const ordenesCompra = await prisma.ordenCompra.findMany();

  if (empresas.length === 0 || proveedores.length === 0) {
    throw new Error('No hay empresas o proveedores disponibles');
  }

  const ordenesData = [];

  for (let i = 0; i < CONFIG.ORDENES_PROVEEDOR; i++) {
    const empresa = faker.helpers.arrayElement(empresas);
    const proveedor = faker.helpers.arrayElement(proveedores);
    const contactosDelProveedor = contactos.filter(c => c.proveedorId === proveedor.id);
    const contacto = contactosDelProveedor.length > 0 ? faker.helpers.arrayElement(contactosDelProveedor) : null;
    const ordenCompra = faker.datatype.boolean({ probability: 0.7 }) ? faker.helpers.arrayElement(ordenesCompra) : null;

    const fechaDespacho = faker.date.between({
      from: new Date('2024-01-01'),
      to: new Date()
    });

    const fechaProgramada = new Date(fechaDespacho.getTime() + faker.number.int({ min: 1, max: 30 }) * 24 * 60 * 60 * 1000);

    ordenesData.push({
      codigoOp: generateCodigoOp(),
      empresaId: empresa.id,
      proveedorId: proveedor.id,
      contactoProveedorId: contacto?.id || null,
      fechaDespacho,
      fechaProgramada,
      fechaRecepcion: new Date(fechaProgramada.getTime() + 5 * 24 * 60 * 60 * 1000),
      notaPedido: faker.lorem.paragraph(),
      totalProveedor: faker.number.float({ min: 300, max: 80000, fractionDigits: 2 }),
      tipoPago: faker.helpers.arrayElement(['CONTADO', 'CREDITO_30', 'CREDITO_60', 'CREDITO_90', 'ADELANTO']),
      notaPago: faker.lorem.sentence(),
      notaGestionOp: faker.lorem.sentence(),
      tipoEntrega: faker.helpers.arrayElement(['ALMACEN', 'OBRA', 'CLIENTE', 'TERCERO']),
      retornoMercaderia: faker.helpers.arrayElement(['SI', 'NO', 'PARCIAL']),
      estadoOp: faker.helpers.arrayElement(['PENDIENTE', 'PROCESANDO', 'ENVIADO', 'ENTREGADO', 'CANCELADO']),
      fechaEntrega: new Date(fechaProgramada.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      cargoOea: faker.helpers.arrayElement(['PROVEEDOR', 'CLIENTE', 'COMPARTIDO']),
      etiquetado: faker.helpers.arrayElement(['REQUERIDO', 'NO_REQUERIDO', 'ESPECIAL']),
      embalaje: faker.helpers.arrayElement(['ESTANDAR', 'REFORZADO', 'ESPECIAL', 'ECOLOGICO']),
      observaciones: faker.lorem.paragraph(),
      notaAdicional: faker.lorem.sentence(),
      notaObservaciones: faker.lorem.sentence(),
      notaCobranzas: faker.lorem.sentence(),
      isCompleted: faker.datatype.boolean({ probability: 0.6 }),
      activo: faker.datatype.boolean({ probability: 0.95 }),
      ordenCompraId: ordenCompra?.id || null,
      estadoRolOp: faker.helpers.arrayElement(Object.values(EstadoRol)),
      estadoRolSeguimiento: faker.helpers.arrayElement(Object.values(EstadoRol))
    });
  }

  await insertInBatches(
    ordenesData,
    async (batch) => {
      const results = [];
      for (const orden of batch) {
        const result = await prisma.ordenProveedor.create({
          data: orden
        });
        results.push(result);
      }
      return results;
    }
  );

  console.log(`✅ ${CONFIG.ORDENES_PROVEEDOR} Órdenes de Proveedor creadas`);
}

async function seedProductosOrdenes() {
  console.log('📦 Generando productos para las órdenes...');

  const ordenesProveedor = await prisma.ordenProveedor.findMany();
  const productosData = [];

  for (const orden of ordenesProveedor) {
    const numProductos = faker.number.int(CONFIG.PRODUCTOS_POR_ORDEN);

    for (let i = 0; i < numProductos; i++) {
      const cantidad = faker.number.int({ min: 1, max: 100 });
      const precioUnitario = faker.number.float({ min: 10, max: 1000, fractionDigits: 2 });
      const total = cantidad * precioUnitario;

      productosData.push({
        codigo: faker.string.alphanumeric(8).toUpperCase(),
        descripcion: faker.commerce.productName(),
        unidadMedida: faker.helpers.arrayElement(['UND', 'KG', 'M', 'M2', 'M3', 'LT', 'GL', 'CJ', 'PAQ', 'DOC']),
        cantidad,
        cantidadAlmacen: faker.number.int({ min: 0, max: cantidad }),
        cantidadTotal: cantidad,
        precioUnitario,
        total,
        ordenProveedorId: orden.id,
        cantidadCliente: faker.number.int({ min: 0, max: cantidad })
      });
    }
  }

  console.log(`📊 Generando ${productosData.length} productos para órdenes...`);

  await insertInBatches(
    productosData,
    async (batch) => {
      const result = await prisma.opProducto.createMany({
        data: batch
      });
      return [result];
    },
    100
  );

  console.log(`✅ ${productosData.length} productos de órdenes creados`);
}

async function seedTransportesAsignadosYPagos() {
  console.log('🚚 Generando transportes asignados y pagos...');

  const ordenesProveedor = await prisma.ordenProveedor.findMany();
  const transportes = await prisma.transporte.findMany();
  const contactosTransporte = await prisma.contacto.findMany({ where: { tipo: ContactoTipo.TRANSPORTE } });

  let totalTransportes = 0;
  let totalPagosTransporte = 0;
  let totalPagosProveedor = 0;

  for (const orden of ordenesProveedor) {
    const numTransportes = faker.number.int({ min: 0, max: 2 });

    for (let i = 1; i <= numTransportes; i++) {
      const transporte = faker.helpers.arrayElement(transportes);
      const contactosDelTransporte = contactosTransporte.filter(c => c.transporteId === transporte.id);
      const contactoTransporteId = contactosDelTransporte.length > 0 ? faker.helpers.arrayElement(contactosDelTransporte).id : null;

      const montoFlete = faker.number.float({ min: 100, max: 5000, fractionDigits: 2 });
      const estadoPago = faker.helpers.arrayElement([EstadoPago.PAGADO, EstadoPago.PENDIENTE, EstadoPago.URGENTE, EstadoPago.PAGO_ENVIADO_VERIFICADO]);

      const transporteAsignado = await prisma.transporteAsignado.create({
        data: {
          codigoTransporte: faker.string.alphanumeric(10).toUpperCase(),
          transporteId: transporte.id,
          ordenProveedorId: orden.id,
          contactoTransporteId,
          region: faker.location.state(),
          provincia: faker.location.city(),
          distrito: faker.location.city(),
          direccion: faker.location.streetAddress(),
          notaTransporte: faker.lorem.sentence(),
          cotizacionTransporte: faker.string.alphanumeric(8).toUpperCase(),
          montoFlete,
          tipoDestino: faker.helpers.arrayElement([TipoDestino.ALMACEN, TipoDestino.CLIENTE, TipoDestino.AGENCIA]),
          estadoPago,
        }
      });

      totalTransportes++;

      const crearPagosTransporte = faker.datatype.boolean({ probability: 0.6 });
      if (crearPagosTransporte) {
        const pagosCount = faker.number.int({ min: 1, max: 2 });
        for (let j = 0; j < pagosCount; j++) {
          await prisma.pagoTransporteAsignado.create({
            data: {
              transporteAsignadoId: transporteAsignado.id,
              fechaPago: faker.date.recent({ days: 120 }),
              bancoPago: faker.helpers.arrayElement(['BCP', 'BBVA', 'SCOTIABANK', 'INTERBANK']),
              descripcionPago: faker.lorem.sentence(),
              archivoPago: null,
              montoPago: faker.number.float({ min: 50, max: Number(montoFlete), fractionDigits: 2 }),
              estadoPago: faker.datatype.boolean({ probability: 0.5 })
            }
          });
          totalPagosTransporte++;
        }
      }
    }

    const crearPagosProveedor = faker.datatype.boolean({ probability: 0.5 });
    if (crearPagosProveedor) {
      const pagosProvCount = faker.number.int({ min: 1, max: 2 });
      for (let k = 0; k < pagosProvCount; k++) {
        await prisma.pagoOrdenProveedor.create({
          data: {
            ordenProveedorId: orden.id,
            fechaPago: faker.date.recent({ days: 120 }),
            bancoPago: faker.helpers.arrayElement(['BCP', 'BBVA', 'SCOTIABANK', 'INTERBANK']),
            descripcionPago: faker.lorem.sentence(),
            archivoPago: null,
            montoPago: faker.number.float({ min: 100, max: Number(orden.totalProveedor || 1000), fractionDigits: 2 }),
            estadoPago: faker.datatype.boolean({ probability: 0.4 })
          }
        });
        totalPagosProveedor++;
      }
    }
  }

  console.log(`✅ Transportes asignados creados: ${totalTransportes}`);
  console.log(`✅ Pagos de transporte creados: ${totalPagosTransporte}`);
  console.log(`✅ Pagos de proveedor creados: ${totalPagosProveedor}`);
}

async function main() {
  const startTime = Date.now();
  console.log('🚀 Iniciando seeding masivo de órdenes...\n');

  try {
    console.log('🧹 Limpiando datos existentes...');
    await prisma.pagoTransporteAsignado.deleteMany();
    await prisma.transporteAsignado.deleteMany();
    await prisma.pagoOrdenProveedor.deleteMany();
    await prisma.opProducto.deleteMany();
    await prisma.ordenProveedor.deleteMany();
    await prisma.ordenCompra.deleteMany();

    await seedOrdenesCompra();
    await seedOrdenesProveedor();
    await seedProductosOrdenes();
    await seedTransportesAsignadosYPagos();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n✅ Seeding de órdenes completado!');
    console.log(`⏱️  Tiempo total: ${duration} segundos\n`);

    const counts = await Promise.all([
      prisma.ordenCompra.count(),
      prisma.ordenProveedor.count(),
      prisma.opProducto.count(),
      prisma.transporteAsignado.count(),
      prisma.pagoTransporteAsignado.count(),
      prisma.pagoOrdenProveedor.count()
    ]);

    console.log('📈 Resumen de registros creados:');
    console.log(`   🛒 Órdenes de Compra: ${counts[0]}`);
    console.log(`   🏭 Órdenes de Proveedor: ${counts[1]}`);
    console.log(`   📦 Productos en órdenes: ${counts[2]}`);
    console.log(`   🚚 Transportes asignados: ${counts[3]}`);
    console.log(`   💳 Pagos de transporte: ${counts[4]}`);
    console.log(`   💳 Pagos de proveedor: ${counts[5]}`);

  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();