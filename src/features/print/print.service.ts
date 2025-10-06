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
    data: ordenProveedor
  };
};
