/**
 * Lógica centralizada de créditos para evitar discrepancias
 */

import { REGLAS_NEGOCIO } from './Propiedades';

export const calcularEstructuraCredito = (monto, plazoMeses, tipo) => {
    const config = REGLAS_NEGOCIO[tipo] || REGLAS_NEGOCIO.personal;
    const montoNum = Number(monto);
    const plazoNum = Number(plazoMeses);
    
    // 1. Definir Quincenas
    const quincenasTotales = plazoNum * 2;
    const qAno1 = plazoNum > 12 ? 24 : quincenasTotales;
    const qAno2 = quincenasTotales > 24 ? quincenasTotales - 24 : 0;

    // 2. Cálculo Año 1 (Basado en tu fórmula de interés simple mensual)
    // Interés total = Monto * Tasa * Meses
    const interesTotalAno1 = montoNum * config.tasaMensual * (qAno1 / 2);
    const cuotaQuincenal1 = (montoNum + interesTotalAno1) / quincenasTotales;

    // 3. Cálculo Año 2 (Tasa reducida al 50% según tu lógica de fidelidad)
    let cuotaQuincenal2 = 0;
    if (plazoNum > 12) {
        const tasaMensualReducida = config.tasaMensual / 2;
        // Amortización base + Interés reducido
        cuotaQuincenal2 = (montoNum / quincenasTotales) + (montoNum * (tasaMensualReducida / 2));
    }

    // 4. Totales Finales
    const totalPagar = (cuotaQuincenal1 * qAno1) + (cuotaQuincenal2 * qAno2);

    return {
        cuotaQuincenal1: Math.round(cuotaQuincenal1 * 100) / 100,
        cuotaQuincenal2: Math.round(cuotaQuincenal2 * 100) / 100,
        totalPagar: Math.round(totalPagar * 100) / 100,
        quincenasTotales,
        qAno1,
        qAno2,
        tasaMensual: config.tasaMensual
    };
};

export const formatMoney = (value) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(value || 0);
};