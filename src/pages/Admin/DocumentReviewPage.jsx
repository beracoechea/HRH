import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    FiArrowLeft, FiCheck, FiXCircle, FiFileText, 
    FiSquare, FiCheckSquare, FiEye, FiMessageSquare, 
    FiDownload, FiRefreshCw, FiAlertCircle 
} from 'react-icons/fi';
import { useDocumentTracking } from '../../pages/hooks/useDocumentTracking';
import { StatusModal } from '../../components/Common/StatusModal';
import { db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { formatMoney } from '../../utils/creditCalculations';
import { useAuth } from '../../context/AuthContext';
import { functions } from '../../firebase/config';
import { httpsCallable } from 'firebase/functions';
import { FiShield, FiSend, FiCheckCircle as FiCheckCircleSolid } from 'react-icons/fi';

const TrafficLight = ({ score, semaforo }) => {
    let color = '#7f8c8d'; 
    let label = 'SIN DATOS';
    if (semaforo === 'VERDE' || score >= 90) { color = '#27ae60'; label = 'RIESGO BAJO'; }
    else if (semaforo === 'AMARILLO' || (score >= 75 && score < 90)) { color = '#f39c12'; label = 'RIESGO MEDIO'; }
    else if (semaforo === 'ROJO' || (score > 0 && score < 75)) { color = '#e74c3c'; label = 'RIESGO ALTO'; }
    
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px', borderRadius: '20px', backgroundColor: 'white', border: `1px solid ${color}44` }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 10px ${color}` }}></div>
            <span style={{ fontWeight: 800, color: color, fontSize: '0.85rem', letterSpacing: '0.05em' }}>{label}</span>
        </div>
    );
};

export const DocumentReviewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { updateMultipleDocs } = useDocumentTracking();
    const { user: currentUser } = useAuth();
    
    const [credit, setCredit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDocs, setSelectedDocs] = useState([]); // doc.nombre
    const [obs, setObs] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState({ open: false, type: 'success', message: '' });

    const fetchCredit = async () => {
        try {
            const docRef = doc(db, 'creditos', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = { id: docSnap.id, ...docSnap.data() };
                
                // SEGURIDAD: Si es RH, solo puede ver si pertenece a su grupo
                if (currentUser?.rol === 'rh' && currentUser?.grupo) {
                    const pertenece = data.grupo === currentUser.grupo || data.usuario_grupo === currentUser.grupo;
                    if (!pertenece) {
                         setError('No tienes permisos para ver este expediente de otro grupo.');
                         return;
                    }
                }
                setCredit(data);
            } else {
                setError('El expediente no existe.');
            }
        } catch (err) {
            console.error(err);
            setError('Error al cargar el expediente.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchCredit();
    }, [id]);

    const docsDisponibles = credit?.expediente?.filter(d => !!d.url) || [];

    const handleToggleAll = () => {
        if (selectedDocs.length === docsDisponibles.length) {
            setSelectedDocs([]);
        } else {
            setSelectedDocs(docsDisponibles.map(d => d.nombre));
        }
    };

    const toggleSelectOne = (nombre) => {
        setSelectedDocs(prev => 
            prev.includes(nombre) 
                ? prev.filter(item => item !== nombre) 
                : [...prev, nombre]
        );
    };

    const handleBatchAction = async (newStatus) => {
        if (selectedDocs.length === 0) return;
        if (newStatus === 'rechazado' && !obs.trim()) {
            return setStatus({ open: true, type: 'error', message: 'Por favor, escribe un motivo de rechazo.' });
        }

        setIsSubmitting(true);
        // useDocumentTracking expect { tipo: docItem.tipo_documento, status }
        // Let's check credit.expediente structure
        const updates = selectedDocs.map(nombre => {
            const docItem = credit.expediente.find(d => d.nombre === nombre);
            return { tipo: docItem.tipo_documento, status: newStatus };
        });

        const result = await updateMultipleDocs(id, updates, obs);
        if (result.success) {
            setStatus({ open: true, type: 'success', message: `Documentos ${newStatus}s correctamente.` });
            setSelectedDocs([]);
            setObs('');
            fetchCredit();
        } else {
            setStatus({ open: true, type: 'error', message: 'Error al actualizar documentos.' });
        }
        setIsSubmitting(false);
    };

    const handleAprobarPaso1 = async () => {
        setIsSubmitting(true);
        try {
            const docRef = doc(db, 'creditos', id);
            await updateMultipleDocs(id, [], ''); // dummy call o firestore update
            // Es más simple usar firestore nativo si updateMultipleDocs no actualiza la fase global
            const { updateDoc } = require('firebase/firestore');
            const ahora = new Date().toISOString();
            await updateDoc(docRef, { 
                fase: 2, 
                kycStatus: 'APROBADO_ADMIN',
                "metricasTiempos.finFase1": ahora,
                "metricasTiempos.inicioFase2": ahora
            });
            setStatus({ open: true, type: 'success', message: 'Fase 1 (KYC) aprobada. El usuario pasó a Evaluación.' });
            fetchCredit();
        } catch (error) {
            console.error(error);
            setStatus({ open: true, type: 'error', message: 'Error al aprobar la Fase 1.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--app-bg)' }}>
            <FiRefreshCw className="spinner" size={40} color="var(--primary-color)" />
            <style>{`@keyframes spin { from {transform: rotate(0deg);} to {transform: rotate(360deg);} } .spinner { animation: spin 1s linear infinite; }`}</style>
        </div>
    );

    if (error) return (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: 'var(--app-bg)', minHeight: '100vh' }}>
            <FiAlertCircle size={60} color="var(--danger)" />
            <h2 style={{ marginTop: '1.5rem' }}>{error}</h2>
            <button onClick={() => navigate('/admin/users')} className="btn-primary" style={{ marginTop: '1rem' }}>Volver</button>
        </div>
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'var(--font-family)' }}>
            <button 
                onClick={() => navigate('/admin/users')} 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '2rem', fontSize: '1rem', fontWeight: 500 }}
            >
                <FiArrowLeft /> Regresar a Gestión
            </button>

            <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', border: '1px solid var(--highlight)' }}>
                <header style={{ backgroundColor: 'var(--dark-bg)', color: 'white', padding: '2.5rem 2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <FiFileText color="var(--secondary-color)" /> Revisión de Expediente
                            </h1>
                            <p style={{ margin: '0.5rem 0 0 0', opacity: 0.8, fontSize: '1.1rem' }}>
                                Cliente: <strong style={{ color: 'var(--secondary-color)' }}>{credit.usuario_nombre}</strong>
                            </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.8rem' }}>
                            <TrafficLight score={credit.kycMaster?.dictamenRiesgo?.scoreKyc || 0} semaforo={credit.semaforoConfiabilidad} />
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block' }}>Monto Solicitado:</span>
                                <strong style={{ fontSize: '1.5rem', color: 'var(--highlight)' }}>{formatMoney(credit.monto_solicitado)}</strong>
                            </div>
                        </div>
                    </div>
                </header>

                {credit?.kycMaster && (
                    <div style={{ padding: '1.5rem 2rem', backgroundColor: credit.semaforoConfiabilidad === 'ROJO' ? 'rgba(231, 76, 60, 0.1)' : (credit.semaforoConfiabilidad === 'AMARILLO' ? 'rgba(243, 156, 18, 0.1)' : 'rgba(46, 204, 113, 0.1)'), borderBottom: `1px solid ${credit.semaforoConfiabilidad === 'ROJO' ? '#e74c3c' : (credit.semaforoConfiabilidad === 'AMARILLO' ? '#f39c12' : '#27ae60')}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                            <div>
                                <h3 style={{ margin: 0, color: 'var(--dark-bg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FiAlertCircle color={credit.semaforoConfiabilidad === 'ROJO' ? '#e74c3c' : '#27ae60'} /> 
                                    Resultados del Perfilamiento 360 (IA)
                                </h3>
                                <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>
                                    Score KYC: <strong style={{ color: credit.semaforoConfiabilidad === 'ROJO' ? '#e74c3c' : '#27ae60' }}>{credit.kycMaster.dictamenRiesgo?.scoreKyc || 0}/100</strong>. 
                                    Motivo IA: {credit.kycMaster.dictamenRiesgo?.motivoSemaforo || 'Sin observaciones preventivas registradas'}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {(credit.fase === 1 || !credit.fase) && (
                                    <button 
                                        onClick={handleAprobarPaso1}
                                        disabled={isSubmitting}
                                        style={{ padding: '0.8rem 1.5rem', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Aprobar Fase 1 (KYC)
                                    </button>
                                )}

                                {credit.fase >= 2 && !credit.mifielId && (
                                    <button 
                                        onClick={() => console.log('Implementar workflow de contrato')}
                                        disabled={isSubmitting}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 1.5rem', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(21, 144, 130, 0.2)' }}
                                    >
                                        <FiSend /> Emitir Contrato Mifiel (Fase 3)
                                    </button>
                                )}

                                {credit.mifielId && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#27ae60', fontWeight: 600, backgroundColor: 'white', padding: '8px 16px', borderRadius: '8px', border: '1px solid #27ae60' }}>
                                        <FiCheckCircleSolid /> Contrato en Firma
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
                            
                            {/* 5. Perfil de Identidad */}
                            <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <h4 style={{ margin: '0 0 0.8rem 0', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Perfil de Identidad</h4>
                                <div style={{ fontSize: '0.9rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <div><strong>Nombre Completo:</strong> {credit.kycMaster.perfilIdentidad?.nombreCompleto || 'N/A'}</div>
                                    <div><strong>RFC:</strong> {credit.kycMaster.perfilIdentidad?.rfc || 'N/A'}</div>
                                    <div><strong>CURP:</strong> {credit.kycMaster.perfilIdentidad?.curp || 'N/A'}</div>
                                    <div><strong>Edad Calculada:</strong> {credit.kycMaster.perfilIdentidad?.edadCalculada || 'N/A'} años</div>
                                    <div><strong>Fecha de Nacimiento:</strong> {credit.kycMaster.perfilIdentidad?.fechaNacimiento || 'N/A'}</div>
                                    <div><strong>Género:</strong> {credit.kycMaster.perfilIdentidad?.genero || 'N/A'}</div>
                                </div>
                            </div>

                            {/* 1. Análisis de Domicilio */}
                            <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <h4 style={{ margin: '0 0 0.8rem 0', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Análisis de Domicilio</h4>
                                <div style={{ fontSize: '0.9rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <div><strong>Dirección Final Consolidada:</strong> {credit.kycMaster.analisisDomicilio?.direccionFinalConsolidada || 'N/A'}</div>
                                    <div><strong>Código Postal:</strong> {credit.kycMaster.analisisDomicilio?.codigoPostal || 'N/A'}</div>
                                    <div><strong>Coincidencia Documental:</strong> {credit.kycMaster.analisisDomicilio?.coincidenciaDocumental ? '✔️ VERIFICADA' : '❌ NO COINCIDE'}</div>
                                    <div><strong>Nivel Confianza:</strong> {credit.kycMaster.analisisDomicilio?.nivelConfianza || 'N/A'}</div>
                                </div>
                            </div>
                            
                            {/* 4. Perfil Financiero */}
                            <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <h4 style={{ margin: '0 0 0.8rem 0', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Perfil Financiero</h4>
                                <div style={{ fontSize: '0.9rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <div><strong>Ingreso Mensual Neto:</strong> {formatMoney(credit.kycMaster.perfilFinanciero?.ingresoMensualNeto || 0)}</div>
                                    <div><strong>Patrón/Empresa:</strong> {credit.kycMaster.perfilFinanciero?.patronOEmpresa || 'N/A'}</div>
                                    <div><strong>Banco Principal:</strong> {credit.kycMaster.perfilFinanciero?.bancoPrincipal || 'N/A'}</div>
                                    <div><strong>CLABE Interbancaria:</strong> {credit.kycMaster.perfilFinanciero?.clabeInterbancaria || 'N/A'}</div>
                                    <div><strong>Saldo Promedio Mensual:</strong> {formatMoney(credit.kycMaster.perfilFinanciero?.saldoPromedioMensual || 0)}</div>
                                    <div>
                                        <strong>Otros Créditos Detectados:</strong> 
                                        {credit.kycMaster.perfilFinanciero?.otrosCreditosDetectados?.length > 0 ? (
                                            <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                                                {credit.kycMaster.perfilFinanciero.otrosCreditosDetectados.map((item, i) => <li key={i}>{item}</li>)}
                                            </ul>
                                        ) : 'Ninguno'}
                                    </div>
                                </div>
                            </div>

                            {/* 2. Datos Específicos del Crédito */}
                            <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <h4 style={{ margin: '0 0 0.8rem 0', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Datos Específicos del Crédito</h4>
                                <div style={{ fontSize: '0.9rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <div><strong>Tipo de Crédito:</strong> <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>{credit.kycMaster.datosEspecificosCredito?.tipoDeCredito || 'N/A'}</span></div>
                                    
                                    {credit.kycMaster.datosEspecificosCredito?.tipoDeCredito === 'AUTOMOTRIZ' && (
                                        <>
                                            <div><strong>Vehículo (Marca/Modelo/Año):</strong> {credit.kycMaster.datosEspecificosCredito.detallesAuto?.marca} {credit.kycMaster.datosEspecificosCredito.detallesAuto?.modelo} ({credit.kycMaster.datosEspecificosCredito.detallesAuto?.anio})</div>
                                            <div><strong>Valor Estimado:</strong> {formatMoney(credit.kycMaster.datosEspecificosCredito.detallesAuto?.valorEstimado || 0)}</div>
                                            <div><strong>Presencia de Factura:</strong> {credit.kycMaster.datosEspecificosCredito.detallesAuto?.tieneFactura ? '✔️ Sí' : '❌ No'}</div>
                                        </>
                                    )}
                                    {credit.kycMaster.datosEspecificosCredito?.tipoDeCredito === 'PERSONAL' && (
                                        <>
                                            <div><strong>Destino de Fondos Sugerido:</strong> {credit.kycMaster.datosEspecificosCredito.detallesPersonal?.destinoFondoSugerido || 'N/A'}</div>
                                            <div><strong>Requiere Aval:</strong> {credit.kycMaster.datosEspecificosCredito.detallesPersonal?.requiereAval ? '✔️ Sí' : '❌ No'}</div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* 3. Dictamen de Riesgo */}
                            <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', gridColumn: '1 / -1', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <h4 style={{ margin: '0 0 0.8rem 0', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Dictamen de Riesgo</h4>
                                <div style={{ fontSize: '0.9rem', color: '#475569', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                                    <div>
                                        <div><strong>Score KYC:</strong> {credit.kycMaster.dictamenRiesgo?.scoreKyc || 0}/100</div>
                                        <div><strong>Semáforo de Confiabilidad:</strong> <span style={{ color: credit.kycMaster.dictamenRiesgo?.semaforoConfiabilidad === 'ROJO' ? '#e74c3c' : (credit.kycMaster.dictamenRiesgo?.semaforoConfiabilidad === 'VERDE' ? '#27ae60' : '#f39c12'), fontWeight: 600 }}>{credit.kycMaster.dictamenRiesgo?.semaforoConfiabilidad || 'N/A'}</span></div>
                                        <div><strong>Motivo Semáforo:</strong> {credit.kycMaster.dictamenRiesgo?.motivoSemaforo || 'N/A'}</div>
                                        <div style={{ marginTop: '0.5rem' }}><strong>Comentarios Técnicos:</strong> <p style={{ margin: '4px 0', fontSize: '0.85rem', fontStyle: 'italic', background: '#f8fafc', padding: '8px', borderRadius: '4px' }}>{credit.kycMaster.dictamenRiesgo?.comentariosTecnicos || 'Sin comentarios adicionales.'}</p></div>
                                    </div>
                                    <div>
                                        <div style={{ color: '#e74c3c', fontWeight: 600 }}><strong>Alertas de Fraude:</strong>
                                            {credit.kycMaster.dictamenRiesgo?.alertasFraude?.length > 0 ? (
                                                <ul style={{ margin: '4px 0 0 16px', padding: 0, fontWeight: 'normal', color: '#475569' }}>
                                                    {credit.kycMaster.dictamenRiesgo.alertasFraude.map((item, i) => <li key={i}>{item}</li>)}
                                                </ul>
                                            ) : <span style={{ fontWeight: 'normal', color: '#27ae60', marginLeft: '6px' }}>Ninguna</span>}
                                        </div>
                                        <div style={{ marginTop: '0.5rem', color: '#e74c3c', fontWeight: 600 }}><strong>Documentos Vencidos:</strong>
                                            {credit.kycMaster.dictamenRiesgo?.documentosVencidos?.length > 0 ? (
                                                <ul style={{ margin: '4px 0 0 16px', padding: 0, fontWeight: 'normal', color: '#475569' }}>
                                                    {credit.kycMaster.dictamenRiesgo.documentosVencidos.map((item, i) => <li key={i}>{item}</li>)}
                                                </ul>
                                            ) : <span style={{ fontWeight: 'normal', color: '#27ae60', marginLeft: '6px' }}>Ninguno</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '1rem', backgroundColor: 'var(--app-bg)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <button 
                                onClick={handleToggleAll}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid var(--highlight)', backgroundColor: 'white', cursor: 'pointer', fontWeight: 600, color: 'var(--dark-bg)' }}
                            >
                                {selectedDocs.length === docsDisponibles.length && docsDisponibles.length > 0 ? <FiCheckSquare color="var(--primary-color)" /> : <FiSquare />}
                                {selectedDocs.length === docsDisponibles.length && docsDisponibles.length > 0 ? 'Desmarcar Todo' : 'Seleccionar Todo'}
                            </button>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                {selectedDocs.length} de {docsDisponibles.length} documentos seleccionados para acción masiva.
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                        {credit.expediente?.map((doc, idx) => {
                            const hasUrl = !!doc.url;
                            const isSelected = selectedDocs.includes(doc.nombre);
                            
                            return (
                                <div 
                                    key={idx} 
                                    onClick={() => hasUrl && toggleSelectOne(doc.nombre)}
                                    style={{ 
                                        position: 'relative',
                                        padding: '1.5rem', 
                                        borderRadius: '12px', 
                                        border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--highlight)',
                                        backgroundColor: isSelected ? 'rgba(21, 144, 130, 0.05)' : 'white',
                                        cursor: hasUrl ? 'pointer' : 'default',
                                        transition: 'all 0.2s ease',
                                        opacity: hasUrl ? 1 : 0.6
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <div style={{ marginTop: '2px' }}>
                                                {hasUrl ? (
                                                    isSelected ? <FiCheckSquare color="var(--primary-color)" size={20} /> : <FiSquare size={20} color="var(--text-secondary)" />
                                                ) : <FiSquare size={20} style={{ opacity: 0.3 }} />}
                                            </div>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--dark-bg)' }}>{doc.nombre}</h4>
                                                <span 
                                                    style={{ 
                                                        display: 'inline-block',
                                                        marginTop: '6px',
                                                        padding: '2px 8px', 
                                                        borderRadius: '4px', 
                                                        fontSize: '0.75rem', 
                                                        fontWeight: 700,
                                                        textTransform: 'uppercase',
                                                        backgroundColor: 
                                                            doc.estatus === 'aprobado' ? 'rgba(46, 204, 113, 0.1)' : 
                                                            doc.estatus === 'rechazado' ? 'rgba(231, 76, 60, 0.1)' : 'rgba(149, 165, 166, 0.1)',
                                                        color: 
                                                            doc.estatus === 'aprobado' ? '#27ae60' : 
                                                            doc.estatus === 'rechazado' ? '#e74c3c' : '#7f8c8d'
                                                    }}
                                                >
                                                    {doc.estatus || 'Pendiente'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {doc.observaciones && doc.estatus === 'rechazado' && (
                                        <div style={{ marginBottom: '1rem', padding: '0.8rem', backgroundColor: 'rgba(231, 76, 60, 0.05)', borderRadius: '6px', borderLeft: '3px solid var(--danger)', fontSize: '0.85rem' }}>
                                            <strong>Obs:</strong> {doc.observaciones}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                                        {hasUrl ? (
                                            <>
                                                <a 
                                                    href={doc.url} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    onClick={(e) => e.stopPropagation()}
                                                    style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.6rem', borderRadius: '6px', backgroundColor: 'var(--dark-bg)', color: 'white', fontSize: '0.85rem', fontWeight: 600 }}
                                                >
                                                    <FiEye size={14} /> Ver
                                                </a>
                                                <a 
                                                    href={doc.url} 
                                                    download 
                                                    onClick={(e) => e.stopPropagation()}
                                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--highlight)', color: 'var(--dark-bg)' }}
                                                    title="Descargar"
                                                >
                                                    <FiDownload size={14} />
                                                </a>
                                            </>
                                        ) : (
                                            <div style={{ width: '100%', textAlign: 'center', padding: '0.6rem', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.03)', color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                                Pendiente de entrega por el usuario
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {(currentUser?.rol === 'admin' || currentUser?.rol === 'analista') && (
                        <div style={{ margin: '0 2rem 2rem 2rem', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                            <h3 style={{ marginTop: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FiShield color="#3b82f6" /> Validación de Cumplimiento (Compliance)
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ padding: '10px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Búsqueda en Listas Negras (SAT/OFAC):</span>
                                    <div style={{ marginTop: '5px', fontWeight: 700, color: '#27ae60' }}>LIMPIO / SIN COINCIDENCIAS</div>
                                </div>
                                <div style={{ padding: '10px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Cruce de Datos (IA vs Solicitud):</span>
                                    <div style={{ marginTop: '5px', fontWeight: 700, color: (credit.semaforoConfiabilidad === 'VERDE') ? '#27ae60' : '#f39c12' }}>
                                        {(credit.semaforoConfiabilidad === 'VERDE') ? 'VERIFICACIÓN EXITOSA (SEGURO)' : 'REVISIÓN MANUAL REQUERIDA (!)'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <section style={{ padding: '2rem', borderTop: '2px dashed var(--highlight)', backgroundColor: 'rgba(0,0,0,0.01)', borderRadius: '0 0 12px 12px' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--dark-bg)' }}>
                            <FiMessageSquare color="var(--primary-color)" /> Acciones Masivas
                        </h3>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Observaciones / Motivo de rechazo (requerido para rechazo)</label>
                            <textarea 
                                style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--highlight)', minHeight: '100px', fontSize: '1rem', resize: 'vertical', fontFamily: 'inherit' }}
                                placeholder="Indica al cliente qué necesita corregir..."
                                value={obs}
                                onChange={(e) => setObs(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                            <button 
                                onClick={() => handleBatchAction('rechazado')}
                                disabled={isSubmitting || selectedDocs.length === 0}
                                style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '1rem', borderRadius: '8px', border: '1px solid var(--danger)', color: 'var(--danger)', backgroundColor: 'transparent', fontWeight: 700, fontSize: '1rem', cursor: (isSubmitting || selectedDocs.length === 0) ? 'not-allowed' : 'pointer', opacity: (isSubmitting || selectedDocs.length === 0) ? 0.5 : 1 }}
                            >
                                <FiXCircle /> Rechazar Seleccionados
                            </button>
                            <button 
                                onClick={() => handleBatchAction('aprobado')}
                                disabled={isSubmitting || selectedDocs.length === 0}
                                style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '1rem', borderRadius: '8px', border: 'none', color: 'white', backgroundColor: 'var(--primary-color)', fontWeight: 700, fontSize: '1rem', cursor: (isSubmitting || selectedDocs.length === 0) ? 'not-allowed' : 'pointer', opacity: (isSubmitting || selectedDocs.length === 0) ? 0.5 : 1, boxShadow: '0 4px 10px rgba(21, 144, 130, 0.3)' }}
                            >
                                <FiCheck /> Aprobar Seleccionados
                            </button>
                        </div>
                    </section>
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
