import React from 'react';
import { EstadoCuentaTemplate } from '../components/Admin/EstadoCuentaTemplate';
import { COMPANY_FISCAL_INFO, getFiscalAddressString } from '../constants/companyInfo';
import { formatMoney } from '../utils/creditCalculations';

const TestEstadoCuenta = () => {
    const today = new Date();
    const dateOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    const periodStr = today.toLocaleString('es-MX', { month: 'short', year: '2-digit' }).replace(' ', '-');

    const mockData = {
        logoTexto: COMPANY_FISCAL_INFO.nombreComercial,
        regContrato: 'HRH-ADMIN-123456',
        empresaRfc: COMPANY_FISCAL_INFO.rfc,
        empresaDomicilio: getFiscalAddressString(),
        empresaTel: COMPANY_FISCAL_INFO.telefono,
        empresaEmail: COMPANY_FISCAL_INFO.email,
        empresaWeb: COMPANY_FISCAL_INFO.web,
        periodo: periodStr,
        emision: today.toLocaleDateString('es-MX', dateOptions),
        
        nombreAcreditado: 'JUAN PÉREZ GARCÍA (CLIENTE DE PRUEBA)',
        acreditadoRfc: 'PEGA800101H10',
        acreditadoDomicilio: 'CALLE FALSA 123, COL. CENTRO',
        acreditadoCiudadCP: 'CIUDAD DE MÉXICO, CDMX C.P. 06000',
        obligadoSolidario: 'MARÍA LÓPEZ',
        tipoCliente: 'Persona Física — Nacionalidad Mexicana',
        
        noCredito: 'TEST-001',
        tipoCredito: 'Personal — Crédito Simple',
        moneda: 'Peso Mexicano (MXN)',
        fechaInicio: '01/Ene/2026',
        primerPago: '15/Ene/2026',
        ultimoPago: '30/Dic/2026',
        
        importeCredito: formatMoney(50000),
        comisionApertura: formatMoney(1500),
        tasaOrdinaria: '48.00% anual',
        tasaMoratoria: '72.00% anual',
        pagosRealizados: '5 de 24',
        diasMora: '0 días',
        noPagos: '24 quincenas',
        pagoMensual: formatMoney(2500),
        pagoUltMensualidad: formatMoney(2500),
        totalPagarPagare: formatMoney(60000),
        pagosPendientes: '19 de 24',
        estatusGeneral: '✔ AL CORRIENTE',

        accAperturaMonto: formatMoney(1500),
        accAperturaIVA: formatMoney(240),
        accAperturaCobro: formatMoney(1740),
        accAperturaTotal: formatMoney(1740),
        accAperturaPago: formatMoney(1740),
        accAperturaPeriodo: 'Período 0',
        accAperturaEstatus: 'COBRADO ✔',

        tabla: [
            { pagoN: 1, fecha: '15/Ene/2026', capital: formatMoney(2000), interes: formatMoney(400), comisiones: formatMoney(0), iva: formatMoney(64), cuota: formatMoney(2464), saldo: formatMoney(48000), tag: 'PAGADO' },
            { pagoN: 2, fecha: '30/Ene/2026', capital: formatMoney(2000), interes: formatMoney(400), comisiones: formatMoney(0), iva: formatMoney(64), cuota: formatMoney(2464), saldo: formatMoney(46000), tag: 'PAGADO' },
            { pagoN: 3, fecha: '15/Feb/2026', capital: formatMoney(2000), interes: formatMoney(400), comisiones: formatMoney(0), iva: formatMoney(64), cuota: formatMoney(2464), saldo: formatMoney(44000), tag: 'PAGADO' },
            { pagoN: 4, fecha: '28/Feb/2026', capital: formatMoney(2000), interes: formatMoney(400), comisiones: formatMoney(0), iva: formatMoney(64), cuota: formatMoney(2464), saldo: formatMoney(42000), tag: 'PAGADO' },
            { pagoN: 5, fecha: '15/Mar/2026', capital: formatMoney(2000), interes: formatMoney(400), comisiones: formatMoney(0), iva: formatMoney(64), cuota: formatMoney(2464), saldo: formatMoney(40000), tag: 'PERÍODO' },
        ],
        totales: {
            capital: formatMoney(50000),
            interes: formatMoney(10000),
            comisiones: formatMoney(0),
            iva: formatMoney(1600),
            cuota: formatMoney(61600),
            saldo: formatMoney(0)
        },

        saldoCorteMes: periodStr.toUpperCase(),
        corteCapitalOrig: formatMoney(50000),
        corteComisionApertura: formatMoney(1500),
        corteAbonadoCapital: `(-) ${formatMoney(10000)}`, 
        corteInteresesPagados: `(-) ${formatMoney(2000)}`,
        corteSaldoInsoluto: formatMoney(40000),
        corteEntregado: formatMoney(12000),
        corteProxMensualidad: formatMoney(2464),
        corteFechaProxPago: '30/Mar/2026',
        corteDiasMora: '0 días — SIN MORA',
        corteEstatus: '✔ AL CORRIENTE',

        notasLegales: `Este estado de cuenta corresponde al Contrato de Crédito asociado, suscrito con ${COMPANY_FISCAL_INFO.razonSocial}. \nIntereses moratorios: 48% anual sobre saldos vencidos. En caso de mora, el incumplimiento genera gastos de cobranza e intereses moratorios.\nContratar créditos que excedan tu capacidad de pago afecta tu historial crediticio. \nAvalista, obligado solidario o coacreditado responderá como obligado principal.`,
        footerBrand: `${COMPANY_FISCAL_INFO.razonSocial} | ${today.toLocaleDateString('es-MX')} | Página 1 de 1`
    };

    return (
        <div style={{ background: '#f3f4f6', minHeight: '100vh', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
            <h1 style={{ color: '#111827' }}>Vista Previa de Estado de Cuenta (Modo Exportación)</h1>
            <div style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', background: 'white' }}>
                <EstadoCuentaTemplate 
                    data={mockData}
                    isExporting={true}
                />
            </div>

            <h1 style={{ color: '#111827', marginTop: '4rem' }}>Vista Previa de Estado de Cuenta (Modo Editor)</h1>
            <div style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', background: 'white' }}>
                <EstadoCuentaTemplate 
                    data={mockData}
                    isExporting={false}
                    onChange={(f, v) => console.log('Edit:', f, v)}
                />
            </div>
        </div>
    );
};

export default TestEstadoCuenta;
