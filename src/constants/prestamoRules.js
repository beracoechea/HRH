// src/constants/prestamoRules.js
export const PRESTAMO_CONFIG = {
    personal: {
        label: 'Crédito Personal',
        minMonto: 5000,
        maxMonto: 50000,
        minPlazo: 6,
        maxPlazo: 24,
        tasaMensual: 0.05, // 5% mensual
    },
    auto: {
        label: 'Crédito Automotriz',
        minMonto: 50000,
        maxMonto: 500000,
        minPlazo: 12,
        maxPlazo: 48,
        tasaMensual: 0.0175, // 1.75% mensual
    }
};

// Fórmula única para evitar discrepancias
export const calcularTotalesBase = (monto, plazo, tipo) => {
    const config = PRESTAMO_CONFIG[tipo.toLowerCase()];
    const tasa = config.tasaMensual;

    // Año 1 (o total si plazo <= 12)
    const mesesAno1 = plazo > 12 ? 12 : plazo;
    const pagoMensualAno1 = (monto * (1 + tasa)) / mesesAno1;
    
    // Año 2 (Interés al 50% según tu lógica original)
    let pagoMensualAno2 = 0;
    if (plazo > 12) {
        const mesesAno2 = plazo - 12;
        pagoMensualAno2 = (monto / plazo) + (monto * (tasa / 2));
    }

    const totalFinal = (pagoMensualAno1 * mesesAno1) + (pagoMensualAno2 * (plazo > 12 ? plazo - 12 : 0));

    return {
        pagoMensualAno1,
        pagoMensualAno2,
        pagoQuincenalAno1: pagoMensualAno1 / 2,
        pagoQuincenalAno2: pagoMensualAno2 / 2,
        totalFinal
    };
};