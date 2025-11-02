import prisma from '../../database/prisma';

export const getOrdenProveedorPrintData = async (id: number) => {
  const ordenProveedor = await prisma.ordenProveedor.findUnique({
    where: { id },
    include: {
      empresa: {
        select: {
          razonSocial: true,
          ruc: true,
          direccion: true,
          telefono: true,
          email: true,
          web: true,
          direcciones: true,
          logo: true,
        },
      },
      proveedor: {
        select: {
          razonSocial: true,
          ruc: true,
          direccion: true,
          telefono: true,
          email: true,
        },
      },
      contactoProveedor: {
        select: {
          nombre: true,
          telefono: true,
          email: true,
          cargo: true,
        },
      },
      productos: true,
      ordenCompra: {
        select: {
          codigoVenta: true,
          fechaEmision: true,
          fechaEntrega: true,
          montoVenta: true,
          direccionEntrega: true,
          distritoEntrega: true,
          provinciaEntrega: true,
          departamentoEntrega: true,
          referenciaEntrega: true,
          cliente: {
            select: {
              razonSocial: true,
              ruc: true,
              direccion: true,
            },
          },
          contactoCliente: {
            select: {
              nombre: true,
              telefono: true,
              email: true,
              cargo: true,
            },
          },
        },
      },
      transportesAsignados: {
        include: {
          transporte: true,
          contactoTransporte: true,
          almacen: true,
        },
      },
    },
  });

  if (!ordenProveedor) {
    throw new Error(`Orden de proveedor con ID ${id} no encontrada.`);
  }
  return {
    ordenProveedor
  };
};

export const getCargosEntregaData = async (fechaInicio: string, fechaFin: string) => {
  // Obtener los datos usando la lógica de generateCargosEntregaHtml pero sin generar HTML
  const ordenesProveedor = await prisma.ordenProveedor.findMany({
    where: {
      fechaProgramada: {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin)
      },
      activo: true
    },
    include: {
      productos: true,
      proveedor: true,
      contactoProveedor: true,
      transportesAsignados: {
        include: {
          transporte: true,
          contactoTransporte: true,
          almacen: true
        }
      },
      ordenCompra: {
        include: {
          cliente: true,
          contactoCliente: true,
          facturaciones: {
            select: {
              factura: true,
              fechaFactura: true,
              facturaArchivo: true,
              grr: true,
              grrArchivo: true,
            }
          }
        }
      }
    },
    orderBy: [
      { fechaProgramada: 'asc' },
      { codigoOp: 'asc' }
    ]
  });

  // Procesar los datos igual que en generateCargosEntregaHtml
  const opsPorFecha = new Map<string, any[]>();

  for (const op of ordenesProveedor) {
    const fechaKey = op.fechaProgramada ? op.fechaProgramada.toISOString().slice(0, 10) : 'sin-fecha';

    if (!opsPorFecha.has(fechaKey)) {
      opsPorFecha.set(fechaKey, []);
    }

    const opData = {
      id: op.id,
      codigoOp: op.codigoOp,
      ocf: op.ordenCompra?.documentoOcf || null,
      estadoOp: op.estadoOp || null,
      fechaProgramada: op.fechaProgramada,
      cartaCci: op.ordenCompra?.cartaCci || null,
      cartaGarantia: op.ordenCompra?.cartaGarantia || null,
      ordenCompraFisica: op.ordenCompra?.documentoOcf || null,
      ordenCompraElectronica: op.ordenCompra?.documentoOce || null,
      facturasArchivo: (op.ordenCompra?.facturaciones || []).map((f: any) => f.facturaArchivo).filter(Boolean),
      grrsArchivo: (op.ordenCompra?.facturaciones || []).map((f: any) => f.grrArchivo).filter(Boolean),
      documentosFacturacion: (op.ordenCompra?.facturaciones || []).map((f: any) => ({
        fechaFactura: f.fechaFactura || null,
        facturaNumero: f.factura || null,
        facturaArchivo: f.facturaArchivo || null,
        grrNumero: f.grr || null,
        grrArchivo: f.grrArchivo || null,
      })),
      productos: op.productos.map(p => ({
        codigo: p.codigo || '',
        descripcion: p.descripcion || '',
        cantidad: p.cantidad || 0
      })),
      proveedor: {
        razonSocial: op.proveedor?.razonSocial || '',
        contacto: op.contactoProveedor ? {
          nombre: op.contactoProveedor.nombre || '',
          telefono: op.contactoProveedor.telefono || '',
          cargo: op.contactoProveedor.cargo || undefined
        } : undefined
      },
      transporteAsignado: op.transportesAsignados && op.transportesAsignados.length > 0 ? {
        transporte: {
          razonSocial: op.transportesAsignados[0].transporte.razonSocial || '',
          ruc: op.transportesAsignados[0].transporte.ruc || '',
          direccion: op.transportesAsignados[0].transporte.direccion || undefined,
          telefono: op.transportesAsignados[0].transporte.telefono || undefined
        },
        contactoTransporte: op.transportesAsignados[0].contactoTransporte ? {
          nombre: op.transportesAsignados[0].contactoTransporte.nombre || '',
          telefono: op.transportesAsignados[0].contactoTransporte.telefono || '',
          cargo: op.transportesAsignados[0].contactoTransporte.cargo || undefined
        } : undefined,
        codigoTransporte: op.transportesAsignados[0].codigoTransporte || '',
        direccion: op.transportesAsignados[0].direccion || undefined,
        montoFlete: op.transportesAsignados[0].montoFlete ? Number(op.transportesAsignados[0].montoFlete) : undefined,
        notaTransporte: op.transportesAsignados[0].notaTransporte || undefined,
        almacen: op.transportesAsignados[0].almacen ? {
          nombre: op.transportesAsignados[0].almacen.nombre || '',
          direccion: op.transportesAsignados[0].almacen.direccion || undefined
        } : undefined
      } : undefined,
      destino: {
        tipo: op.ordenCompra?.cliente ? 'Cliente' : 'Destino',
        cliente: op.ordenCompra?.cliente ? {
          razonSocial: op.ordenCompra.cliente.razonSocial || ''
        } : undefined,
        direccion: op.ordenCompra?.direccionEntrega || '',
        distrito: op.ordenCompra?.distritoEntrega || '',
        provincia: op.ordenCompra?.provinciaEntrega || '',
        departamento: op.ordenCompra?.departamentoEntrega || '',
        referencia: op.ordenCompra?.referenciaEntrega || undefined,
        contacto: op.ordenCompra?.contactoCliente ? {
          nombre: op.ordenCompra.contactoCliente.nombre || '',
          telefono: op.ordenCompra.contactoCliente.telefono || '',
          cargo: op.ordenCompra.contactoCliente.cargo || undefined
        } : undefined
      },
      observacion: op.observaciones || undefined
    };

    opsPorFecha.get(fechaKey)!.push(opData);
  }

  const fechasConCargos = Array.from(opsPorFecha.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, ops]) => ({
      fecha: fecha === 'sin-fecha' ? 'Sin fecha programada' : new Date(fecha).toLocaleDateString('es-ES'),
      ops: ops.map((op: any, index: number) => ({ ...op, numero: index + 1 }))
    }));

  const data = {
    fechaInicio: new Date(fechaInicio).toLocaleDateString('es-ES'),
    fechaFin: new Date(fechaFin).toLocaleDateString('es-ES'),
    fechaGeneracion: new Date().toLocaleDateString('es-ES') + ' ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    fechasConCargos,
    totalOps: ordenesProveedor.length
  };

  return data;
};

export const getCotizacionPrintData = async (id: number) => {
  const cotizacion = await prisma.cotizacion.findUnique({
    where: { id },
    include: {
      empresa: {
        select: {
          razonSocial: true,
          ruc: true,
          direccion: true,
          telefono: true,
          email: true,
          web: true,
          direcciones: true,
          logo: true,
        },
      },
      cliente: {
        select: {
          razonSocial: true,
          ruc: true,
          direccion: true,
          telefono: true,
          email: true,
        },
      },
      contactoCliente: {
        select: {
          nombre: true,
          telefono: true,
          email: true,
          cargo: true,
        },
      },
      productos: true,
    },
  });

  if (!cotizacion) {
    throw new Error(`Cotización con ID ${id} no encontrada.`);
  }
  
  return {
    cotizacion
  };
};
