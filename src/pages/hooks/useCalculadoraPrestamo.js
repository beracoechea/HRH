import { useState, useMemo, useEffect } from 'react';
import { calcularEstructuraCredito, formatMoney } from '../../utils/creditCalculations';
import { REGLAS_NEGOCIO } from '../../utils/Propiedades';

export const useCalculadoraPrestamo = () => {
    const [monto, setMonto] = useState(10000);
    const [plazo, setPlazo] = useState(12);
    const [tipoCredito, setTipoCredito] = useState('personal');

    useEffect(() => {
        const r = REGLAS_NEGOCIO[tipoCredito];
        if (monto < r.minMonto) setMonto(r.minMonto);
        if (monto > r.maxMonto) setMonto(r.maxMonto);
        if (plazo < r.minPlazo) setPlazo(r.minPlazo);
        if (plazo > r.maxPlazo) setPlazo(r.maxPlazo);
    }, [tipoCredito, monto, plazo]);

    const calculos = useMemo(() => {
        const res = calcularEstructuraCredito(monto, plazo * 2, tipoCredito);
        return {
            pagoMensualAno1: res.cuotaQuincenal1, // Se muestra como quincenal en UI
            pagoMensualAno2: res.cuotaQuincenal2,
            cuotaQuincenal1: res.cuotaQuincenal1, // Alias para compatibilidad
            cuotaQuincenal2: res.cuotaQuincenal2,
            totalPagarFinal: res.totalPagar,
            totalPagar: res.totalPagar, // Alias para compatibilidad
            tasaAplicada: res.tasaMensual,
            reglas: REGLAS_NEGOCIO[tipoCredito]
        };
    }, [monto, plazo, tipoCredito]);

    return { monto, setMonto, plazo, setPlazo, tipoCredito, setTipoCredito, formatMoney, ...calculos };
};