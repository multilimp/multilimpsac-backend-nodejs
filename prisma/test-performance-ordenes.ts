import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPerformanceOrdenes() {
  console.log('🚀 Iniciando pruebas de rendimiento con órdenes...\n');

  const tests = [
    {
      name: 'Conteo de Órdenes de Compra',
      test: async () => {
        const count = await prisma.ordenCompra.count();
        return { count };
      }
    },
    {
      name: 'Conteo de Órdenes de Proveedor',
      test: async () => {
        const count = await prisma.ordenProveedor.count();
        return { count };
      }
    },
    {
      name: 'Conteo de Productos en Órdenes',
      test: async () => {
        const count = await prisma.opProducto.count();
        return { count };
      }
    },
    {
      name: 'Consulta compleja - OC con relaciones',
      test: async () => {
        const ordenes = await prisma.ordenCompra.findMany({
          take: 100,
          include: {
            cliente: true,
            empresa: true,
            contactoCliente: true,
            cobrador: true
          },
          orderBy: {
            fechaEmision: 'desc'
          }
        });
        return { count: ordenes.length };
      }
    },
    {
      name: 'Consulta compleja - OP con productos',
      test: async () => {
        const ordenes = await prisma.ordenProveedor.findMany({
          take: 50,
          include: {
            empresa: true,
            proveedor: true,
            contactoProveedor: true,
            productos: {
              take: 10
            }
          },
          orderBy: {
            fechaDespacho: 'desc'
          }
        });
        return { count: ordenes.length, productos: ordenes.reduce((acc, orden) => acc + orden.productos.length, 0) };
      }
    },
    {
      name: 'Agregaciones por estado de OP',
      test: async () => {
        const agregaciones = await prisma.ordenProveedor.groupBy({
          by: ['estadoOp'],
          _count: {
            id: true
          },
          _sum: {
            totalProveedor: true
          },
          _avg: {
            totalProveedor: true
          }
        });
        return { grupos: agregaciones.length };
      }
    },
    {
      name: 'Búsqueda filtrada por rango de fechas',
      test: async () => {
        const fechaInicio = new Date('2024-01-01');
        const fechaFin = new Date('2024-12-31');

        const ordenes = await prisma.ordenCompra.findMany({
          where: {
            fechaEmision: {
              gte: fechaInicio,
              lte: fechaFin
            },
            montoVenta: {
              gte: 10000
            }
          },
          take: 200
        });
        return { count: ordenes.length };
      }
    },
    {
      name: 'Productos más vendidos en órdenes',
      test: async () => {
        const productos = await prisma.opProducto.groupBy({
          by: ['codigo'],
          _sum: {
            cantidad: true,
            total: true
          },
          _count: {
            id: true
          },
          orderBy: {
            _sum: {
              cantidad: 'desc'
            }
          },
          take: 20
        });
        return { productos: productos.length };
      }
    },
    {
      name: 'Órdenes por empresa con totales',
      test: async () => {
        const empresas = await prisma.empresa.findMany({
          include: {
            ordenesCompra: {
              select: {
                id: true,
                montoVenta: true
              }
            },
            ordenesProveedor: {
              select: {
                id: true,
                totalProveedor: true
              }
            }
          },
          take: 10
        });
        return { empresas: empresas.length };
      }
    },
    {
      name: 'Búsqueda de texto en códigos de orden',
      test: async () => {
        const ordenes = await prisma.ordenCompra.findMany({
          where: {
            codigoVenta: {
              contains: 'OC-2024'
            }
          },
          take: 100
        });
        return { count: ordenes.length };
      }
    }
  ];

  const resultados = [];
  let tiempoTotal = 0;

  for (const test of tests) {
    console.log(`⏳ Ejecutando: ${test.name}...`);
    const inicio = Date.now();

    try {
      const resultado = await test.test();
      const tiempo = Date.now() - inicio;
      tiempoTotal += tiempo;

      console.log(`✅ ${test.name}: ${tiempo}ms`);
      console.log(`   Resultado: ${JSON.stringify(resultado)}\n`);

      resultados.push({
        nombre: test.name,
        tiempo,
        resultado,
        estado: 'exitoso'
      });
    } catch (error) {
      const tiempo = Date.now() - inicio;
      console.log(`❌ ${test.name}: Error en ${tiempo}ms`);
      console.log(`   Error: ${error}\n`);

      resultados.push({
        nombre: test.name,
        tiempo,
        error: error instanceof Error ? error.message : String(error),
        estado: 'error'
      });
    }
  }

  console.log('📊 RESUMEN DE RENDIMIENTO CON ÓRDENES');
  console.log('=====================================');
  console.log(`⏱️  Tiempo total de pruebas: ${tiempoTotal}ms`);
  console.log(`📈 Pruebas ejecutadas: ${tests.length}`);
  console.log(`✅ Pruebas exitosas: ${resultados.filter(r => r.estado === 'exitoso').length}`);
  console.log(`❌ Pruebas con error: ${resultados.filter(r => r.estado === 'error').length}`);

  const tiempoPromedio = tiempoTotal / tests.length;
  console.log(`📊 Tiempo promedio por consulta: ${tiempoPromedio.toFixed(2)}ms`);

  let calificacion = 'EXCELENTE';
  if (tiempoPromedio > 1000) calificacion = 'BUENO';
  if (tiempoPromedio > 2000) calificacion = 'REGULAR';
  if (tiempoPromedio > 5000) calificacion = 'NECESITA OPTIMIZACIÓN';

  console.log(`🏆 Calificación de rendimiento: ${calificacion}`);

  if (resultados.some(r => r.estado === 'error')) {
    console.log('\n⚠️  Errores encontrados:');
    resultados
      .filter(r => r.estado === 'error')
      .forEach(r => console.log(`   - ${r.nombre}: ${r.error}`));
  }
}

testPerformanceOrdenes()
  .catch(console.error)
  .finally(() => prisma.$disconnect());