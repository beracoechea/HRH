import { generarTablaAmortizacion, calcularEstructuraCredito } from './creditCalculations';

/**
 * Utilidad para normalizar los datos de un crédito provenientes de Firestore.
 * Resuelve el conflicto de nombres de campos entre diferentes versiones del sistema.
 */
export const normalizeCreditData = (cre) => {
  if (!cre) return { q1: 0, q2: 0, total: 0, monto: 0, plazo: 0, faseA: 0, faseB: 0 };

  const q1 = parseFloat(cre.pago_quincenal_ano1 || cre.cuotaQuincenal1 || cre.pago1 || cre.cuotaFaseA || 0);
  const q2 = parseFloat(cre.pago_quincenal_ano2 || cre.cuotaQuincenal2 || cre.pago2 || cre.cuotaFaseB || 0);
  const total = parseFloat(cre.total_estimado || cre.totalPagar || cre.totalPagarFinal || 0);
  const monto = parseFloat(cre.monto_solicitado || cre.montoReal || cre.monto || 0);
  const plazo = parseInt(cre.plazo_meses || cre.plazoMeses || cre.plazo || 0);

  // Extraemos explícitamente Fase A y Fase B para el esquema
  const faseA = parseFloat(cre.cuotaFaseA || q1 || 0);
  const faseB = parseFloat(cre.cuotaFaseB || q2 || 0);

  return { q1, q2, total, monto, plazo, faseA, faseB };
};

/**
 * Calcula el monto esperado para el mes actual basándose en la tabla de amortización real.
 */
export const getExpectedMonthlyPayment = (cre) => {
  if (!cre || cre.estado === 'pendiente' || cre.estado === 'rechazado') {
    return { q1: 0, q2: 0, totalMes: 0, faseA: 0, faseB: 0 };
  }

  const norm = normalizeCreditData(cre);
  const tasa = cre.tasaMensual || 0.04;
  const fechaInicio = cre.createdAt?.toDate ? cre.createdAt.toDate() : new Date(cre.createdAt || Date.now());

  // Obtenemos los valores nominales de las fases para visualización
  const { cuotaFaseA, cuotaFaseB, gracia } = calcularEstructuraCredito(norm.monto, norm.plazo * 2, 'personal', tasa);
  
  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const anioActual = ahora.getFullYear();

  // Generamos la tabla de amortización técnica para proyecciones reales
  const tabla = generarTablaAmortizacion(norm.monto, norm.plazo * 2, tasa, fechaInicio);
  
  let q1 = 0;
  let q2 = 0;

  tabla.forEach(pago => {
    const [d, m, y] = pago.fecha.split('/');
    const fechaPago = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));

    if (fechaPago.getMonth() === mesActual && fechaPago.getFullYear() === anioActual) {
      if (fechaPago.getDate() <= 15) q1 += pago.cuota;
      else q2 += pago.cuota;
    }
  });

  // Si no hay pagos registrados en el mes de amortización, proyectamos los valores nominales
  if (cre.estado === 'activo' || cre.estado === 'atrasado') {
      if (q1 === 0 || q2 === 0) {
          // Determinamos fase actual aproximada
          const pagado = cre.pagado || 0;
          const cuotasPagadas = Math.floor(pagado / (cuotaFaseA || 1));
          const nominalActual = cuotasPagadas < gracia ? cuotaFaseA : cuotaFaseB;
          
          if (q1 === 0) q1 = nominalActual;
          if (q2 === 0) q2 = nominalActual;
      }
  }

  return { 
    q1, q2, totalMes: q1 + q2,
    faseA: cuotaFaseA,
    faseB: cuotaFaseB
  };
};



