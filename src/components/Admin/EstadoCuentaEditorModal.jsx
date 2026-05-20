import React, { useState, useEffect } from 'react';
import { FiX, FiCheckCircle, FiLoader, FiDownload } from 'react-icons/fi';
import { EstadoCuentaTemplate } from './EstadoCuentaTemplate';
import { formatMoney, generarTablaAmortizacion } from '../../utils/creditCalculations';
import { COMPANY_FISCAL_INFO, getFiscalAddressString } from '../../constants/companyInfo';
import { useAccountStatements } from '../../pages/hooks/useAccountStatements';
import html2pdf from 'html2pdf.js';
import { StatusModal } from '../Common/StatusModal';

export const EstadoCuentaEditorModal = ({ isOpen, onClose, credito, user }) => {
    const [formData, setFormData] = useState(null);
    const { uploadStatement } = useAccountStatements(credito?.id);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExporting, setIsExporting] = useState(false); // New state for PDF view
    const [status, setStatus] = useState({ open: false, type: '', message: '' });

    useEffect(() => {
        if (isOpen && credito) {
            initializeData();
        }
    }, [isOpen, credito]);

    const initializeData = () => {
        const today = new Date();
        const dateOptions = { day: '2-digit', month: 'short', year: 'numeric' };
        const periodStr = today.toLocaleString('es-MX', { month: 'short', year: '2-digit' }).replace(' ', '-');
        
        // Calcular Amortización
        const rawTable = generarTablaAmortizacion(
            credito.monto_solicitado, 
            (credito.plazo_meses || 0) * 2, 
            credito.tasaMensual || 0.04,
            credito.fecha_aprobacion ? new Date(credito.fecha_aprobacion.toDate ? credito.fecha_aprobacion.toDate() : credito.fecha_aprobacion) : new Date()
        );

        let pagadoRestante = credito.pagado || 0;
        let pagosRealizados = 0;
        let pagoMensualidad = rawTable.length > 0 ? rawTable[rawTable.length - 1].cuota : 0; // Usando el de fase B
        let proxMensualidad = pagoMensualidad;
        let proxFecha = '';

        const tablaConMapeo = rawTable.map(row => {
            let tag = '';
            // Si el monto pagado aún cubre esta cuota
            if (pagadoRestante >= row.cuota) {
                tag = 'PAGADO';
                pagadoRestante -= row.cuota;
                pagosRealizados++;
            } else if (pagadoRestante > 0 && pagadoRestante < row.cuota) {
                tag = 'PERÍODO'; // Pago parcial = periodo actual
                proxMensualidad = row.cuota;
                proxFecha = row.fecha;
                pagadoRestante = 0;
            } else {
                if (!proxFecha) {
                    tag = 'PERÍODO';
                    proxMensualidad = row.cuota;
                    proxFecha = row.fecha;
                }
            }
            return {
                ...row,
                cuota: formatMoney(row.cuota),
                capital: formatMoney(row.capital),
                interes: formatMoney(row.interes),
                iva: formatMoney(row.iva),
                comisiones: formatMoney(0),
                saldo: formatMoney(row.saldo),
                tag
            };
        });

        const initial = {
            logoTexto: COMPANY_FISCAL_INFO.nombreComercial,
            regContrato: localStorage.getItem('hrh_regContratoAdmin') || '',
            empresaRfc: COMPANY_FISCAL_INFO.rfc,
            empresaDomicilio: getFiscalAddressString(),
            empresaTel: COMPANY_FISCAL_INFO.telefono,
            empresaEmail: COMPANY_FISCAL_INFO.email,
            empresaWeb: COMPANY_FISCAL_INFO.web,
            periodo: periodStr,
            emision: today.toLocaleDateString('es-MX', dateOptions),
            
            nombreAcreditado: credito.kycMaster?.perfilIdentidad?.nombreCompleto || credito.usuario_nombre,
            acreditadoRfc: credito.kycMaster?.perfilIdentidad?.rfc || '',
            acreditadoDomicilio: `${credito.kycMaster?.perfilDireccion?.calle || ''} ${credito.kycMaster?.perfilDireccion?.numeroExterior || ''}, Col. ${credito.kycMaster?.perfilDireccion?.colonia || ''}`,
            acreditadoCiudadCP: `${credito.kycMaster?.perfilDireccion?.municipioDelegacion || ''}, ${credito.kycMaster?.perfilDireccion?.estado || ''} C.P. ${credito.kycMaster?.perfilDireccion?.codigoPostal || ''}`,
            obligadoSolidario: 'N/A',
            tipoCliente: 'Persona Física — Nacionalidad Mexicana',
            
            noCredito: credito.id?.slice(-6).toUpperCase(),
            tipoCredito: `Personal — ${credito.tipo_credito}`,
            moneda: 'Peso Mexicano (MXN)',
            fechaInicio: credito.fecha_aprobacion ? new Date(credito.fecha_aprobacion.toDate ? credito.fecha_aprobacion.toDate() : credito.fecha_aprobacion).toLocaleDateString('es-MX', dateOptions) : '',
            primerPago: rawTable[0]?.fecha || '',
            ultimoPago: rawTable[rawTable.length - 1]?.fecha || '',
            
            importeCredito: formatMoney(credito.monto_solicitado),
            comisionApertura: formatMoney(0),
            tasaOrdinaria: `${((credito.tasaMensual || 0.04) * 12 * 100).toFixed(2)}% anual`,
            tasaMoratoria: '48.00% anual',
            pagosRealizados: `${pagosRealizados} de ${rawTable.length}`,
            diasMora: '0 días',
            noPagos: `${rawTable.length} quincenas`,
            pagoMensual: formatMoney(pagoMensualidad),
            pagoUltMensualidad: formatMoney(rawTable[rawTable.length - 1]?.cuota || 0),
            totalPagarPagare: formatMoney(credito.total_estimado),
            pagosPendientes: `${rawTable.length - pagosRealizados} de ${rawTable.length}`,
            estatusGeneral: '✔ AL CORRIENTE',

            accAperturaMonto: formatMoney(0),
            accAperturaIVA: formatMoney(0),
            accAperturaCobro: formatMoney(0),
            accAperturaTotal: formatMoney(0),
            accAperturaPago: formatMoney(0),
            accAperturaPeriodo: 'Período 0',
            accAperturaEstatus: 'COBRADO ✔',

            tabla: tablaConMapeo,
            totales: {
                capital: formatMoney(credito.monto_solicitado),
                interes: formatMoney((credito.total_estimado || 0) - (credito.monto_solicitado || 0)),
                comisiones: formatMoney(0),
                iva: formatMoney(0),
                cuota: formatMoney(credito.total_estimado),
                saldo: formatMoney(0)
            },

            saldoCorteMes: periodStr.toUpperCase(),
            corteCapitalOrig: formatMoney(credito.monto_solicitado),
            corteComisionApertura: formatMoney(0),
            corteAbonadoCapital: `(-) ${formatMoney(pagadoRestante > 0 ? credito.pagado : credito.pagado)}`, 
            corteInteresesPagados: `(-) ${formatMoney(0)}`,
            corteSaldoInsoluto: formatMoney((credito.total_estimado || 0) - (credito.pagado || 0)),
            corteEntregado: formatMoney(credito.pagado || 0),
            corteProxMensualidad: formatMoney(proxMensualidad),
            corteFechaProxPago: proxFecha || '',
            corteDiasMora: '0 días — SIN MORA',
            corteEstatus: '✔ AL CORRIENTE',

            notasLegales: `Este estado de cuenta corresponde al Contrato de Crédito asociado, suscrito con ${COMPANY_FISCAL_INFO.razonSocial}. \nIntereses moratorios: 48% anual sobre saldos vencidos. En caso de mora, el incumplimiento genera gastos de cobranza e intereses moratorios.\nContratar créditos que excedan tu capacidad de pago afecta tu historial crediticio. \nAvalista, obligado solidario o coacreditado responderá como obligado principal.`,
            footerBrand: `${COMPANY_FISCAL_INFO.razonSocial} | ${today.toLocaleDateString('es-MX')} | Página 1 de 1`
        };
        setFormData(initial);
    };

    const handleFieldChange = (field, value) => {
        if (field === 'tabla') {
            const newTabla = [...formData.tabla];
            newTabla[value.idx][value.field] = value.value;
            setFormData({ ...formData, tabla: newTabla });
        } else {
            if (field === 'regContrato') {
                localStorage.setItem('hrh_regContratoAdmin', value);
            }
            setFormData({ ...formData, [field]: value });
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setIsExporting(true); // Switch to read-only view for capture
        
        // Wait a bit for the DOM to update to the read-only version
        await new Promise(resolve => setTimeout(resolve, 300));

        try {
            const element = document.getElementById('estado-cuenta-export-pdf');
            const opt = {
                margin: [5, 0, 5, 0], // Small margin
                filename: `Estado_Cuenta_${credito.id}_${formData.periodo}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2, 
                    useCORS: true,
                    logging: false,
                    letterRendering: true,
                    windowWidth: 1000 // Force standard width for capture
                },
                jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' }
            };

            const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
            const file = new File([pdfBlob], `Estado_Cuenta_${formData.periodo}.pdf`, { type: 'application/pdf' });
            
            const res = await uploadStatement(file, `Estado de Cuenta - ${formData.periodo}`, user?.id || 'admin');
            
            if (res.success) {
                setStatus({ open: true, type: 'success', message: 'Estado de Cuenta generado y enviado al cliente con éxito.' });
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                throw new Error(res.message);
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
            setStatus({ open: true, type: 'error', message: 'Ocurrió un error al generar o guardar el estado de cuenta.' });
        } finally {
            setIsGenerating(false);
            setIsExporting(false); // Switch back to editor view
        }
    };

    if (!isOpen || !formData) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', overflowY: 'auto', padding: '2rem 0' }}>
            <div style={{ backgroundColor: '#f3f4f6', borderRadius: '12px', width: '1000px', maxWidth: '95%', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
                
                {/* Header Modal */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', position: 'sticky', top: 0, zIndex: 10 }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#111827', fontSize: '1.5rem' }}>Generar Estado de Cuenta</h2>
                        <p style={{ margin: '0.2rem 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
                            Corrige los campos necesarios. Estos cambios se reflejarán directamente en el PDF final enviado al cliente.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={onClose} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                            Cancelar
                        </button>
                        <button 
                            onClick={handleGenerate} 
                            disabled={isGenerating}
                            style={{ padding: '0.5rem 1rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: isGenerating ? 'not-allowed' : 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            {isGenerating ? <FiLoader className="spinner" /> : <FiCheckCircle />}
                            Aprobar y Emitir a Cliente
                        </button>
                    </div>
                </div>

                {/* Editor Body */}
                <div style={{ padding: '2rem', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
                    {/* Shadow wrapper to show standard page boundaries */}
                    <div style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                        <EstadoCuentaTemplate 
                            id="estado-cuenta-export-pdf"
                            data={formData}
                            onChange={handleFieldChange}
                            isExporting={isExporting}
                        />
                    </div>
                </div>
            </div>

            <StatusModal 
                isOpen={status.open} 
                type={status.type} 
                message={status.message} 
                onClose={() => setStatus({ ...status, open: false })} 
            />
        </div>
    );
};
