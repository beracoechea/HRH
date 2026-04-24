/**
 * Lógica centralizada de créditos - Modelo HRH 2022
 * Implementa dos fases: Gracia de Capital e Interés Puro + Amortización Francesa
 */

export const calcularEstructuraCredito = (monto, plazoQuincenas, tipo, manualTasa = null) => {
    const montoNum = Number(monto);
    const totalQuincenas = Number(plazoQuincenas);
    
    // Tasa quincenal (la manual es mensual, la dividimos entre 2)
    const tasaMensual = manualTasa !== null ? Number(manualTasa) : 0.04; // fallback a 4%
    const iq = tasaMensual / 2;

    // Regla de periodos de gracia (Interés Puro)
    let periodosGracia = 0;
    if (totalQuincenas === 30) periodosGracia = 6;
    else if (totalQuincenas === 48) periodosGracia = 24;
    else if (totalQuincenas > 30) periodosGracia = 12; // Regla sugerida para intermedios

    // --- FASE A: Interés Puro ---
    const pagoFaseA = montoNum * iq;

    // --- FASE B: Amortización Francesa ---
    const nRestante = totalQuincenas - periodosGracia;
    let pagoFaseB = 0;
    if (nRestante > 0) {
        pagoFaseB = (montoNum * iq) / (1 - Math.pow(1 + iq, -nRestante));
    }

    // Totales de referencia (Basados en quincenas)
    const totalPagar = (pagoFaseA * periodosGracia) + (pagoFaseB * nRestante);

    return {
        cuotaFaseA: Math.round(pagoFaseA * 100) / 100, // Pago quincenal inicial (Gracia)
        cuotaFaseB: Math.round(pagoFaseB * 100) / 100, // Pago quincenal después de gracia
        cuotaQuincenal1: periodosGracia > 0 ? Math.round(pagoFaseA * 100) / 100 : Math.round(pagoFaseB * 100) / 100, // Ajuste para mostrar pago real si no hay gracia
        cuotaQuincenal2: Math.round(pagoFaseB * 100) / 100, // Alias para compatibilidad con Tesorería
        totalPagar: Math.round(totalPagar * 100) / 100,
        quincenasTotales: totalQuincenas,
        gracia: periodosGracia,
        tasaMensual: tasaMensual,
        tasaQuincenal: iq
    };
};

/**
 * Genera la tabla completa de amortización considerando las dos fases
 */
export const generarTablaAmortizacion = (monto, plazoQuincenas, tasaMensual, fechaInicio = new Date()) => {
    const struct = calcularEstructuraCredito(monto, plazoQuincenas, 'personal', tasaMensual);
    const tabla = [];
    let saldoInsoluto = Number(monto);
    const iq = tasaMensual / 2;
    const fecha = new Date(fechaInicio);

    for (let p = 1; p <= struct.quincenasTotales; p++) {
        let interes = saldoInsoluto * iq;
        let capital = 0;
        let cuota = 0;

        if (p <= struct.gracia) {
            // Fase A: Solo Interés
            cuota = struct.cuotaFaseA;
            capital = 0;
            // Ajustamos el interés para que coincida con la cuota fija de fase A
            interes = cuota; 
        } else {
            // Fase B: Amortización progresiva (Francés)
            cuota = struct.cuotaFaseB;
            capital = cuota - interes;
            // Último pago: Ajustar para que el saldo llegue a 0
            if (p === struct.quincenasTotales) {
                capital = saldoInsoluto;
                cuota = capital + interes;
            }
        }

        saldoInsoluto -= capital;

        // Mover fecha 15 días (aproximación quincenal)
        fecha.setDate(fecha.getDate() + 15);

        tabla.push({
            pagoN: p,
            fecha: new Date(fecha).toLocaleDateString('es-MX'),
            cuota: Math.round(cuota * 100) / 100,
            capital: Math.round(capital * 100) / 100,
            interes: Math.round(interes * 100) / 100,
            iva: 0,
            saldo: Math.max(0, Math.round(saldoInsoluto * 100) / 100)
        });
    }

    return tabla;
};

export const formatMoney = (value) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(value || 0);
};