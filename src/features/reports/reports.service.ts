import prisma from '../../database/prisma';

// ============= REPORTE DE VENTAS =============
export const getVentasReportData = async (
    year: number,
    mesInicio: number,
    mesFin: number,
    filtroRango?: string
) => {
    // Filtro de rango por monto de venta (igual a Blade)
    const rangoConfig = [
        { key: 'menor-1k', label: '-1k', color: 'rgba(254,157,1,255)' },
        { key: '1k-2k', label: '-2k', color: 'rgba(24,120,177,255)' },
        { key: '2k-5k', label: '-5k', color: 'rgba(8,184,171,255)' },
        { key: 'mayor-5k', label: '+5k', color: 'rgba(0,0,0,255)' },
    ];

    const getRangoKey = (montoVenta: number) => {
        if (montoVenta <= 1000) return 'menor-1k';
        if (montoVenta <= 2000) return '1k-2k';
        if (montoVenta <= 5000) return '2k-5k';
        return 'mayor-5k';
    };

    // Obtener órdenes de compra del año
    const ordenesCompra = await prisma.ordenCompra.findMany({
        where: {
            fechaForm: {
                gte: new Date(`${year}-01-01`),
                lte: new Date(`${year}-12-31`),
            },
            etapaSiaf: { not: 'RES' }, // Excluir canceladas/resueltas
            estadoActivo: true,
        },
        include: {
            cliente: true,
            empresa: true,
            ordenesProveedor: {
                select: { totalProveedor: true, codigoOp: true },
            },
        },
    });

    const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];

    const buildOrderMetrics = (oc: typeof ordenesCompra[number]) => {
        const montoVenta = Number(oc.montoVenta || 0);
        const totalProveedor = oc.ordenesProveedor.reduce(
            (sum, op) => sum + Number(op.totalProveedor || 0),
            0
        );
        const utilidad = montoVenta - totalProveedor;
        const porcentajeUtilidad = montoVenta > 0 ? (utilidad / montoVenta) * 100 : 0;

        return {
            montoVenta,
            utilidad: Number(utilidad.toFixed(2)),
            porcentajeUtilidad: Number(porcentajeUtilidad.toFixed(2)),
        };
    };

    // Filtrar por mes inicio/fin
    const ordenesFiltradas = ordenesCompra.filter((oc) => {
        if (!oc.fechaForm) return false;
        const mes = oc.fechaForm.getMonth() + 1;
        return mes >= mesInicio && mes <= mesFin;
    });

    // Calcular utilidad y aplicar filtro
    const datosTabla = ordenesFiltradas
        .map((oc) => {
            const metrics = buildOrderMetrics(oc);

            return {
                id: oc.id,
                codigoVenta: oc.codigoVenta,
                cliente: oc.cliente?.razonSocial || 'N/A',
                fecha: oc.fechaForm?.toISOString().split('T')[0],
                montoVenta: metrics.montoVenta,
                opProveedor: oc.ordenesProveedor.map((op) => op.codigoOp).join(', '),
                utilidad: metrics.utilidad,
                porcentajeUtilidad: metrics.porcentajeUtilidad,
            };
        })
        .filter((item) => {
            if (!filtroRango) return true;
            return getRangoKey(item.montoVenta) === filtroRango;
        });

    const ordenesAnualesFiltradas = ordenesCompra.filter((oc) => {
        if (!oc.fechaForm) return false;
        if (!filtroRango) return true;
        const metrics = buildOrderMetrics(oc);
        return getRangoKey(metrics.montoVenta) === filtroRango;
    });

    const ordenesResumen = filtroRango
        ? ordenesFiltradas.filter((oc) => getRangoKey(Number(oc.montoVenta || 0)) === filtroRango)
        : ordenesFiltradas;

    const resumenRangosTotals = rangoConfig.reduce(
        (acc, range) => {
            acc[range.key] = { monto: 0, oc: 0 };
            return acc;
        },
        {} as Record<string, { monto: number; oc: number }>
    );

    ordenesResumen.forEach((oc) => {
        const montoVenta = Number(oc.montoVenta || 0);
        const rangoKey = getRangoKey(montoVenta);
        resumenRangosTotals[rangoKey].monto += montoVenta;
        resumenRangosTotals[rangoKey].oc += 1;
    });

    const resumenTotalMonto = ordenesResumen.reduce((sum, oc) => sum + Number(oc.montoVenta || 0), 0);
    const resumenTotalOc = ordenesResumen.length;

    const resumenRangos = rangoConfig.map((range) => {
        const info = resumenRangosTotals[range.key];
        const porcentaje = resumenTotalOc > 0 ? (info.oc / resumenTotalOc) * 100 : 0;
        return {
            key: range.key,
            label: range.label,
            color: range.color,
            monto: Number(info.monto.toFixed(2)),
            oc: info.oc,
            porcentaje: Number(porcentaje.toFixed(2)),
        };
    });

    const monthlyRangos = {
        total: Array(12).fill(0),
        menor1k: Array(12).fill(0),
        menor2k: Array(12).fill(0),
        menor5k: Array(12).fill(0),
        mayor5k: Array(12).fill(0),
    };

    ordenesCompra.forEach((oc) => {
        if (!oc.fechaForm) return;
        const mesIndex = oc.fechaForm.getMonth();
        const montoVenta = Number(oc.montoVenta || 0);
        monthlyRangos.total[mesIndex] += montoVenta;
        const rangoKey = getRangoKey(montoVenta);
        if (rangoKey === 'menor-1k') monthlyRangos.menor1k[mesIndex] += montoVenta;
        if (rangoKey === '1k-2k') monthlyRangos.menor2k[mesIndex] += montoVenta;
        if (rangoKey === '2k-5k') monthlyRangos.menor5k[mesIndex] += montoVenta;
        if (rangoKey === 'mayor-5k') monthlyRangos.mayor5k[mesIndex] += montoVenta;
    });

    // Desglose mensual (rango seleccionado)
    const desgloseMensual: { [key: number]: number } = {};
    for (let m = mesInicio; m <= mesFin; m++) {
        desgloseMensual[m] = 0;
    }

    ordenesFiltradas.forEach((oc) => {
        if (oc.fechaForm) {
            const mes = oc.fechaForm.getMonth() + 1;
            if (mes >= mesInicio && mes <= mesFin) {
                desgloseMensual[mes] += Number(oc.montoVenta || 0);
            }
        }
    });

    // Desglose mensual anual (12 meses)
    const desgloseMensualAnual: { [key: number]: number } = {};
    for (let m = 1; m <= 12; m++) {
        desgloseMensualAnual[m] = 0;
    }

    ordenesAnualesFiltradas.forEach((oc) => {
        if (oc.fechaForm) {
            const mes = oc.fechaForm.getMonth() + 1;
            desgloseMensualAnual[mes] += Number(oc.montoVenta || 0);
        }
    });

    // Calcular totales
    const totalVentas = datosTabla.reduce((sum, item) => sum + item.montoVenta, 0);
    const utilidadTotal = datosTabla.reduce((sum, item) => sum + item.utilidad, 0);
    const porcentajeUtilidadPromedio =
        datosTabla.length > 0
            ? datosTabla.reduce((sum, item) => sum + item.porcentajeUtilidad, 0) / datosTabla.length
            : 0;

    return {
        resumen: {
            totalVentas: Number(totalVentas.toFixed(2)),
            cantidadOrdenes: datosTabla.length,
            utilidadTotal: Number(utilidadTotal.toFixed(2)),
            porcentajeUtilidadPromedio: Number(porcentajeUtilidadPromedio.toFixed(2)),
            año: year,
            mesInicio,
            mesFin,
        },
        resumenRangosTotal: {
            monto: Number(resumenTotalMonto.toFixed(2)),
            oc: resumenTotalOc,
        },
        resumenRangos,
        tabla: datosTabla,
        gráficoMensual: {
            meses: Array.from({ length: mesFin - mesInicio + 1 }, (_, i) => {
                const mes = mesInicio + i;
                return monthLabels[mes - 1];
            }),
            datos: Array.from({ length: mesFin - mesInicio + 1 }, (_, i) => {
                const mes = mesInicio + i;
                return desgloseMensual[mes] || 0;
            }),
        },
        rangoMensual: {
            meses: monthLabels,
            total: monthlyRangos.total,
            menor1k: monthlyRangos.menor1k,
            menor2k: monthlyRangos.menor2k,
            menor5k: monthlyRangos.menor5k,
            mayor5k: monthlyRangos.mayor5k,
        },
        mensualAnual: {
            meses: monthLabels,
            datos: Array.from({ length: 12 }, (_, i) => {
                const mes = i + 1;
                return desgloseMensualAnual[mes] || 0;
            }),
        },
    };
};

// ============= REPORTE DE ENTREGAS =============
export const getEntregasReportData = async (year: number, mesInicio: number, mesFin: number) => {
    const ordenesCompra = await prisma.ordenCompra.findMany({
        where: {
            fechaForm: {
                gte: new Date(`${year}-01-01`),
                lte: new Date(`${year}-12-31`),
            },
            estadoActivo: true,
        },
        include: {
            cliente: true,
            ordenesProveedor: {
                select: { totalProveedor: true },
            },
        },
    });

    const ordenesFiltradas = ordenesCompra.filter((oc) => {
        if (!oc.fechaForm) return false;
        const mes = oc.fechaForm.getMonth() + 1;
        return mes >= mesInicio && mes <= mesFin;
    });

    // Clasificar entregas
    const conformes: typeof ordenesFiltradas = [];
    const noConformes: typeof ordenesFiltradas = [];
    const pendientes: typeof ordenesFiltradas = [];

    ordenesFiltradas.forEach((oc) => {
        if (!oc.fechaEntregaOc) {
            pendientes.push(oc);
        } else if (oc.fechaEntregaOc <= oc.fechaMaxForm!) {
            conformes.push(oc);
        } else {
            noConformes.push(oc);
        }
    });

    // Tabla principal
    const datosTabla = ordenesFiltradas.map((oc) => {
        const totalOp = oc.ordenesProveedor.reduce((sum, op) => sum + Number(op.totalProveedor || 0), 0);
        return {
            id: oc.id,
            codigoVenta: oc.codigoVenta,
            cliente: oc.cliente?.razonSocial || 'N/A',
            fechaMaxForm: oc.fechaMaxForm?.toISOString().split('T')[0],
            fechaEntrega: oc.fechaEntregaOc?.toISOString().split('T')[0],
            montoVenta: Number(oc.montoVenta || 0),
            totalOp: Number(totalOp.toFixed(2)),
            penalidad: Number(oc.penalidad || 0),
            estado: !oc.fechaEntregaOc ? 'Pendiente' : oc.fechaEntregaOc <= oc.fechaMaxForm! ? 'Conforme' : 'No Conforme',
        };
    });

    // Desglose mensual
    const desgloseConformes: { [key: number]: number } = {};
    const desgloseNoConformes: { [key: number]: number } = {};

    for (let m = mesInicio; m <= mesFin; m++) {
        desgloseConformes[m] = 0;
        desgloseNoConformes[m] = 0;
    }

    conformes.forEach((oc) => {
        if (oc.fechaEntregaOc) {
            const mes = oc.fechaEntregaOc.getMonth() + 1;
            if (mes >= mesInicio && mes <= mesFin) {
                desgloseConformes[mes]++;
            }
        }
    });

    noConformes.forEach((oc) => {
        if (oc.fechaEntregaOc) {
            const mes = oc.fechaEntregaOc.getMonth() + 1;
            if (mes >= mesInicio && mes <= mesFin) {
                desgloseNoConformes[mes]++;
            }
        }
    });

    const meses = Array.from({ length: mesFin - mesInicio + 1 }, (_, i) => {
        const mes = mesInicio + i;
        return ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'][mes - 1];
    });

    return {
        resumen: {
            totalOrdenes: ordenesFiltradas.length,
            conformes: conformes.length,
            noConformes: noConformes.length,
            pendientes: pendientes.length,
            porcentajeConformidad:
                ordenesFiltradas.length > 0
                    ? Number(((conformes.length / (conformes.length + noConformes.length)) * 100).toFixed(2))
                    : 0,
            año: year,
            mesInicio,
            mesFin,
        },
        tabla: datosTabla,
        gráficoLinea: {
            meses,
            conformes: Array.from({ length: mesFin - mesInicio + 1 }, (_, i) => {
                const mes = mesInicio + i;
                return desgloseConformes[mes] || 0;
            }),
            noConformes: Array.from({ length: mesFin - mesInicio + 1 }, (_, i) => {
                const mes = mesInicio + i;
                return desgloseNoConformes[mes] || 0;
            }),
        },
    };
};

// ============= REPORTE DE COBRANZA =============
export const getCobranzaReportData = async (year: number, etapasSiaf: string[] = []) => {
    const ordenesCompra = await prisma.ordenCompra.findMany({
        where: {
            fechaForm: {
                gte: new Date(`${year}-01-01`),
                lte: new Date(`${year}-12-31`),
            },
            estadoActivo: true,
        },
        include: {
            cliente: true,
        },
    });

    // Filtrar por etapas SIAF si se especifican
    let ordenesFiltradas = ordenesCompra;
    if (etapasSiaf.length > 0) {
        ordenesFiltradas = ordenesCompra.filter((oc) => etapasSiaf.includes(oc.etapaSiaf || ''));
    }

    // Tabla principal
    const datosTabla = ordenesFiltradas.map((oc) => ({
        id: oc.id,
        codigoVenta: oc.codigoVenta,
        cliente: oc.cliente?.razonSocial || 'N/A',
        montoVenta: Number(oc.montoVenta || 0),
        fechaEntrega: oc.fechaEntregaOc?.toISOString().split('T')[0],
        etapaSiaf: oc.etapaSiaf || 'N/A',
    }));

    // Desglose por etapa SIAF
    const conteoEtapas: { [key: string]: number } = {};
    const montoEtapas: { [key: string]: number } = {};

    const etapasUnicas = new Set(ordenesFiltradas.map((oc) => oc.etapaSiaf || 'NINGUNO'));

    etapasUnicas.forEach((etapa: string) => {
        const filtradasPorEtapa = ordenesFiltradas.filter((oc) => (oc.etapaSiaf || 'NINGUNO') === etapa);
        conteoEtapas[etapa] = filtradasPorEtapa.length;
        montoEtapas[etapa] = filtradasPorEtapa.reduce((sum, oc) => sum + Number(oc.montoVenta || 0), 0);
    });

    // Desglose mensual
    const desgloseMensual: { [key: number]: { monto: number; pendiente: number } } = {};
    for (let m = 1; m <= 12; m++) {
        desgloseMensual[m] = { monto: 0, pendiente: 0 };
    }

    ordenesFiltradas.forEach((oc) => {
        if (oc.fechaForm) {
            const mes = oc.fechaForm.getMonth() + 1;
            const montoVenta = Number(oc.montoVenta || 0);
            desgloseMensual[mes].monto += montoVenta;

            if (oc.etapaSiaf !== 'PAG') {
                desgloseMensual[mes].pendiente += montoVenta;
            }
        }
    });

    return {
        resumen: {
            totalOrdenes: ordenesFiltradas.length,
            montoTotal: Number(ordenesFiltradas.reduce((sum, oc) => sum + Number(oc.montoVenta || 0), 0).toFixed(2)),
            montoPendiente: Number(
                ordenesFiltradas
                    .filter((oc) => oc.etapaSiaf !== 'PAG')
                    .reduce((sum, oc) => sum + Number(oc.montoVenta || 0), 0)
                    .toFixed(2)
            ),
            año: year,
        },
        tabla: datosTabla,
        etapas: {
            etapasUnicas: Array.from(etapasUnicas),
            conteo: conteoEtapas,
            monto: montoEtapas,
        },
        desgloseMensual: Array.from({ length: 12 }, (_, i) => ({
            mes: i + 1,
            nombreMes: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'][i],
            monto: desgloseMensual[i + 1].monto,
            pendiente: desgloseMensual[i + 1].pendiente,
        })),
    };
};

// ============= REPORTE DE RANKING =============
export const getRankingReportData = async (year: number, mes?: number, región?: string) => {
    let whereClause: any = {
        fechaForm: {
            gte: new Date(`${year}-01-01`),
            lte: new Date(`${year}-12-31`),
        },
        estadoActivo: true,
    };

    if (mes) {
        whereClause.fechaForm = {
            gte: new Date(`${year}-${String(mes).padStart(2, '0')}-01`),
            lte: new Date(`${year}-${String(mes).padStart(2, '0')}-31`),
        };
    }

    const ordenesCompra = await prisma.ordenCompra.findMany({
        where: whereClause,
        include: {
            cliente: true,
        },
    });

    // Filtrar por región si se especifica
    let ordenesFiltradas = ordenesCompra;
    if (región) {
        ordenesFiltradas = ordenesCompra.filter((oc) => oc.departamentoEntrega === región);
    }

    // Ranking por departamento
    const rankingDepartamentos: { [key: string]: { monto: number; cantidad: number } } = {};

    ordenesFiltradas.forEach((oc) => {
        const dpto = oc.departamentoEntrega || 'N/A';
        if (!rankingDepartamentos[dpto]) {
            rankingDepartamentos[dpto] = { monto: 0, cantidad: 0 };
        }
        rankingDepartamentos[dpto].monto += Number(oc.montoVenta || 0);
        rankingDepartamentos[dpto].cantidad += 1;
    });

    const topDepartamentos = Object.entries(rankingDepartamentos)
        .map(([dpto, data]) => ({
            departamento: dpto,
            monto: Number(data.monto.toFixed(2)),
            cantidad: data.cantidad,
        }))
        .sort((a, b) => b.monto - a.monto)
        .slice(0, 3);

    // Ranking por cliente
    const rankingClientes: {
        [key: number]: { cliente: string; ruc: string; monto: number; cantidad: number };
    } = {};

    ordenesFiltradas.forEach((oc) => {
        if (!rankingClientes[oc.clienteId || 0]) {
            rankingClientes[oc.clienteId || 0] = {
                cliente: oc.cliente?.razonSocial || 'N/A',
                ruc: oc.cliente?.ruc || 'N/A',
                monto: 0,
                cantidad: 0,
            };
        }
        rankingClientes[oc.clienteId || 0].monto += Number(oc.montoVenta || 0);
        rankingClientes[oc.clienteId || 0].cantidad += 1;
    });

    const topClientes = Object.values(rankingClientes)
        .map((client) => ({
            ...client,
            monto: Number(client.monto.toFixed(2)),
        }))
        .sort((a, b) => b.monto - a.monto)
        .slice(0, 3);

    return {
        resumen: {
            totalOrdenes: ordenesFiltradas.length,
            montoTotal: Number(ordenesFiltradas.reduce((sum, oc) => sum + Number(oc.montoVenta || 0), 0).toFixed(2)),
            año: year,
            mes,
            región: región,
        },
        topDepartamentos,
        topClientes,
        regiones: Array.from(new Set(ordenesCompra.map((oc) => oc.departamentoEntrega || 'N/A'))),
    };
};

// ============= REPORTE DE UTILIDAD =============
export const getUtilidadReportData = async (
    year: number,
    mesInicio: number,
    mesFin: number,
    empresaId?: number
) => {
    const ordenesCompra = await prisma.ordenCompra.findMany({
        where: {
            fechaForm: {
                gte: new Date(`${year}-01-01`),
                lte: new Date(`${year}-12-31`),
            },
            ...(empresaId && { empresaId }),
            estadoActivo: true,
        },
        include: {
            empresa: true,
            ordenesProveedor: {
                select: { totalProveedor: true },
            },
        },
    });

    const ordenesFiltradas = ordenesCompra.filter((oc) => {
        if (!oc.fechaForm) return false;
        const mes = oc.fechaForm.getMonth() + 1;
        return mes >= mesInicio && mes <= mesFin;
    });

    // Clasificar por rangos de utilidad
    const rangos = {
        'mayor-5k': { min: 5001, max: Infinity, label: '+5k', datos: [] as any[] },
        '2k-5k': { min: 2001, max: 5000, label: '2k-5k', datos: [] as any[] },
        '1k-2k': { min: 1001, max: 2000, label: '1k-2k', datos: [] as any[] },
        'menor-1k': { min: -Infinity, max: 1000, label: '-1k', datos: [] as any[] },
    };

    let totalUtilidad = 0;
    let totalVentas = 0;

    ordenesFiltradas.forEach((oc) => {
        const montoVenta = Number(oc.montoVenta || 0);
        const totalProveedor = oc.ordenesProveedor.reduce((sum, op) => sum + Number(op.totalProveedor || 0), 0);
        const utilidad = montoVenta - totalProveedor;

        totalVentas += montoVenta;
        totalUtilidad += utilidad;

        for (const [key, rango] of Object.entries(rangos)) {
            if (utilidad > rango.min && utilidad <= rango.max) {
                rango.datos.push({
                    id: oc.id,
                    empresa: oc.empresa?.razonSocial || 'N/A',
                    codigoVenta: oc.codigoVenta,
                    montoVenta,
                    utilidad: Number(utilidad.toFixed(2)),
                });
                break;
            }
        }
    });

    const tablaGráficos = Object.entries(rangos).map(([key, rango]) => ({
        rango: rango.label,
        cantidad: rango.datos.length,
        montoTotal: Number(rango.datos.reduce((sum, item) => sum + item.montoVenta, 0).toFixed(2)),
        utilidadTotal: Number(rango.datos.reduce((sum, item) => sum + item.utilidad, 0).toFixed(2)),
        porcentaje:
            ordenesFiltradas.length > 0 ? Number(((rango.datos.length / ordenesFiltradas.length) * 100).toFixed(2)) : 0,
    }));

    // Obtener empresas disponibles
    const empresasDisponibles = await prisma.empresa.findMany({
        select: { id: true, razonSocial: true },
    });

    return {
        resumen: {
            totalOrdenes: ordenesFiltradas.length,
            totalVentas: Number(totalVentas.toFixed(2)),
            totalUtilidad: Number(totalUtilidad.toFixed(2)),
            porcentajeUtilidadPromedio:
                totalVentas > 0 ? Number(((totalUtilidad / totalVentas) * 100).toFixed(2)) : 0,
            año: year,
            mesInicio,
            mesFin,
        },
        tabla: tablaGráficos,
        detalleRangos: rangos,
        empresas: empresasDisponibles,
    };
};
