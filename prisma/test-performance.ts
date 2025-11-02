import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPerformance() {
  console.log('🚀 Iniciando pruebas de rendimiento...\n');

  try {
    // Test 1: Consulta simple de conteo
    console.log('📊 Test 1: Conteo de registros');
    const startCount = Date.now();
    
    const counts = await Promise.all([
      prisma.empresa.count(),
      prisma.cliente.count(),
      prisma.proveedor.count(),
      prisma.producto.count(),
      prisma.cotizacion.count(),
      prisma.cotizacionProducto.count(),
      prisma.stockProducto.count()
    ]);
    
    const countTime = Date.now() - startCount;
    console.log(`   Empresas: ${counts[0]}`);
    console.log(`   Clientes: ${counts[1]}`);
    console.log(`   Proveedores: ${counts[2]}`);
    console.log(`   Productos: ${counts[3]}`);
    console.log(`   Cotizaciones: ${counts[4]}`);
    console.log(`   Productos en cotizaciones: ${counts[5]}`);
    console.log(`   Stock de productos: ${counts[6]}`);
    console.log(`   ⏱️  Tiempo: ${countTime}ms\n`);

    // Test 2: Consulta compleja con joins
    console.log('🔍 Test 2: Consulta compleja con relaciones');
    const startComplex = Date.now();
    
    const cotizacionesCompletas = await prisma.cotizacion.findMany({
      take: 50,
      include: {
        cliente: {
          include: {
            contactos: true
          }
        },
        contactoCliente: true,
        empresa: true,
        productos: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    const complexTime = Date.now() - startComplex;
    console.log(`   Cotizaciones obtenidas: ${cotizacionesCompletas.length}`);
    console.log(`   ⏱️  Tiempo: ${complexTime}ms\n`);

    // Test 3: Agregaciones
    console.log('📈 Test 3: Agregaciones y estadísticas');
    const startAgg = Date.now();
    
    const estadisticas = await prisma.cotizacion.aggregate({
      _avg: {
        montoTotal: true
      },
      _sum: {
        montoTotal: true
      },
      _count: {
        id: true
      },
      _max: {
        montoTotal: true
      },
      _min: {
        montoTotal: true
      }
    });
    
    const aggTime = Date.now() - startAgg;
    console.log(`   Total cotizaciones: ${estadisticas._count.id}`);
    console.log(`   Monto promedio: S/ ${estadisticas._avg.montoTotal?.toFixed(2)}`);
    console.log(`   Monto total: S/ ${estadisticas._sum.montoTotal?.toFixed(2)}`);
    console.log(`   Monto máximo: S/ ${estadisticas._max.montoTotal?.toFixed(2)}`);
    console.log(`   Monto mínimo: S/ ${estadisticas._min.montoTotal?.toFixed(2)}`);
    console.log(`   ⏱️  Tiempo: ${aggTime}ms\n`);

    // Test 4: Búsqueda con filtros
    console.log('🔎 Test 4: Búsqueda con filtros múltiples');
    const startSearch = Date.now();
    
    const busquedaCompleja = await prisma.cotizacion.findMany({
      where: {
        AND: [
          {
            montoTotal: {
              gte: 1000
            }
          },
          {
            estado: 'PENDIENTE'
          },
          {
            cliente: {
              razonSocial: {
                contains: 'S.A.C'
              }
            }
          }
        ]
      },
      include: {
        cliente: true,
        empresa: true,
        productos: true
      },
      take: 20
    });
    
    const searchTime = Date.now() - startSearch;
    console.log(`   Resultados encontrados: ${busquedaCompleja.length}`);
    console.log(`   ⏱️  Tiempo: ${searchTime}ms\n`);

    // Test 5: Consulta de productos con stock
    console.log('📦 Test 5: Productos con información de stock');
    const startStock = Date.now();
    
    const productosConStock = await prisma.producto.findMany({
      take: 100,
      include: {
        stockProductos: {
          include: {
            almacen: true
          }
        }
      },
      where: {
        stockProductos: {
          some: {
            cantidad: {
              gt: 0
            }
          }
        }
      }
    });
    
    const stockTime = Date.now() - startStock;
    console.log(`   Productos con stock: ${productosConStock.length}`);
    console.log(`   ⏱️  Tiempo: ${stockTime}ms\n`);

    // Resumen final
    const totalTime = countTime + complexTime + aggTime + searchTime + stockTime;
    console.log('🎯 Resumen de rendimiento:');
    console.log(`   ⏱️  Tiempo total de pruebas: ${totalTime}ms`);
    console.log(`   📊 Conteos: ${countTime}ms`);
    console.log(`   🔍 Consulta compleja: ${complexTime}ms`);
    console.log(`   📈 Agregaciones: ${aggTime}ms`);
    console.log(`   🔎 Búsqueda filtrada: ${searchTime}ms`);
    console.log(`   📦 Productos con stock: ${stockTime}ms`);
    
    if (totalTime < 2000) {
      console.log('   ✅ Rendimiento excelente (< 2s)');
    } else if (totalTime < 5000) {
      console.log('   ⚡ Rendimiento bueno (< 5s)');
    } else {
      console.log('   ⚠️  Rendimiento mejorable (> 5s)');
    }

  } catch (error) {
    console.error('❌ Error en las pruebas de rendimiento:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPerformance();