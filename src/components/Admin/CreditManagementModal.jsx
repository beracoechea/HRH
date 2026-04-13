import React, { useState, useEffect, useMemo } from 'react';
import { 
    FiX, FiEdit2, FiFileText, FiShield, FiTrendingUp, 
    FiCheckCircle, FiAlertCircle, FiClock, FiDollarSign,
    FiSave, FiRefreshCw, FiArrowLeft, FiSend, FiEye, FiDownload, FiPlus, FiPieChart,
    FiCheck, FiTrash2, FiUpload, FiUsers, FiLock
} from 'react-icons/fi';
import { db } from '../../firebase/config';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useCreditActions } from '../../pages/hooks/useCreditActions';
import { useDocumentTracking } from '../../pages/hooks/useDocumentTracking';
import { formatMoney, calcularEstructuraCredito } from '../../utils/creditCalculations';
import { REGLAS_NEGOCIO } from '../../utils/Propiedades';
import { StatusModal } from '../Common/StatusModal';
import { CREDIT_STEPS } from '../../constants/creditSteps';

import '../../assets/styles/CreditManagementModal.css';

export const CreditManagementModal = ({ isOpen, creditId, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('resumen');
    const [credit, setCredit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const { updateCreditConditions, updateCreditStatus } = useCreditActions();
    const { updateMultipleDocs, updateSingleDocStatus, addAdminDocument } = useDocumentTracking();

    const [formData, setFormData] = useState({
        monto: 0,
        meses: 0,
        tipo: 'personal',
        tasa: 0
    });

    const [statusModal, setStatusModal] = useState({ open: false, type: 'success', message: '' });

    useEffect(() => {
        if (isOpen && creditId) {
            fetchCreditData();
            setActiveTab('resumen');
        }
    }, [isOpen, creditId]);

    const fetchCreditData = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, 'creditos', creditId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = { id: docSnap.id, ...docSnap.data() };
                setCredit(data);
                
                const monto = Number(data.monto_solicitado) || 0;
                const tipo = data.tipo_credito?.toLowerCase().includes('auto') ? 'auto' : 'personal';
                const config = REGLAS_NEGOCIO[tipo] || REGLAS_NEGOCIO.personal;

                setFormData({
                    monto: monto,
                    meses: Number(data.plazo_meses) || 0,
                    tipo: tipo,
                    tasa: data.tasaMensual || config.tasaMensual
                });
            }
        } catch (error) {
            console.error("Error fetching credit:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculos = useMemo(() => {
        return calcularEstructuraCredito(formData.monto, formData.meses, formData.tipo, formData.tasa);
    }, [formData]);

    const handleSaveConditions = async () => {
        setIsSaving(true);
        const res = await updateCreditConditions({
            creditoId: creditId,
            nuevoMonto: Number(formData.monto),
            nuevoPlazo: Number(formData.meses),
            pagoQ1: calculos.cuotaQuincenal1,
            pagoQ2: calculos.cuotaQuincenal2,
            totalEstimado: calculos.totalPagar,
            tasaMensual: formData.tasa
        });
        if (res.success) {
            setStatusModal({ open: true, type: 'success', message: 'Condiciones actualizadas.' });
            fetchCreditData();
            onUpdate();
        }
        setIsSaving(false);
    };

    const handleAction = async (newStatus) => {
        setIsSaving(true);
        const res = await updateCreditStatus(creditId, newStatus);
        if (res.success) {
            setStatusModal({ open: true, type: 'success', message: `Crédito ${newStatus} correctamente.` });
            fetchCreditData();
            onUpdate();
        }
        setIsSaving(false);
    };

    if (!isOpen) return null;

    return (
        <div className="credit-modal-overlay">
            <div className="credit-modal-container animate-slide-up">
                <header className="modal-header-main">
                    <div className="header-info-group">
                        <div className="credit-ref-badge">REF: {creditId?.slice(-6).toUpperCase()}</div>
                        <h2>{credit?.usuario_nombre || 'Cargando...'}</h2>
                        <div className={`status-pill-large ${credit?.estado}`}>{credit?.estado?.toUpperCase()}</div>
                    </div>
                    <button className="btn-close-modal" onClick={onClose}><FiX /></button>
                </header>

                <nav className="modal-nav">
                    <button className={activeTab === 'resumen' ? 'active' : ''} onClick={() => setActiveTab('resumen')}>
                        <FiPieChart /> Resumen
                    </button>
                    <button className={activeTab === 'condiciones' ? 'active' : ''} onClick={() => setActiveTab('condiciones')}>
                        <FiEdit2 /> Condiciones
                    </button>
                    {(credit?.estado === 'activo' || credit?.estado === 'atrasado' || credit?.estado === 'finalizado') && (
                        <button className={activeTab === 'pagos' ? 'active' : ''} onClick={() => setActiveTab('pagos')}>
                            <FiPlus /> Pagos
                        </button>
                    )}
                    <button className={activeTab === 'documentos' ? 'active' : ''} onClick={() => setActiveTab('documentos')}>
                        <FiFileText /> Documentación
                    </button>
                    <button className={activeTab === 'analisis' ? 'active' : ''} onClick={() => setActiveTab('analisis')}>
                        <FiShield /> Análisis IA
                    </button>
                    <button className={activeTab === 'etapas' ? 'active' : ''} onClick={() => setActiveTab('etapas')}>
                        <FiTrendingUp /> Línea de Tiempo
                    </button>
                </nav>

                <div className="modal-content-body">
                    {loading ? (
                        <div className="modal-loading">
                            <FiRefreshCw className="spinner" />
                            <p>Cargando información del crédito...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'resumen' && <ResumenTab credit={credit} onAction={handleAction} isSaving={isSaving} />}
                            {activeTab === 'condiciones' && <CondicionesTab formData={formData} setFormData={setFormData} calculos={calculos} onSave={handleSaveConditions} isSaving={isSaving} />}
                            {activeTab === 'pagos' && <PagosTab credit={credit} onUpdate={fetchCreditData} />}
                            {activeTab === 'documentos' && <DocumentosTab credit={credit} onUpdate={fetchCreditData} />}
                            {activeTab === 'analisis' && <AnalisisIATab credit={credit} />}
                            {activeTab === 'etapas' && <EtapasTab credit={credit} onUpdate={fetchCreditData} />}
                        </>
                    )}
                </div>
            </div>

            <StatusModal 
                isOpen={statusModal.open}
                type={statusModal.type}
                message={statusModal.message}
                onClose={() => setStatusModal({ ...statusModal, open: false })}
            />
        </div>
    );
};

// --- SUB-COMPONENTES DE PESTAÑAS ---

const ResumenTab = ({ credit, onAction, isSaving }) => {
    const score = credit?.kycMaster?.dictamenRiesgo?.scoreKyc || 0;
    const semaforo = credit?.semaforoConfiabilidad || 'GRIS';
    
    return (
        <div className="tab-pane animate-fade">
            <div className="resumen-grid">
                <div className="resumen-main-card">
                    <div className="score-section">
                        <div className={`score-circle ${semaforo}`}>
                            <span className="score-value">{score}</span>
                            <span className="score-label">Score IA</span>
                        </div>
                        <div className="score-desc">
                            <h4>Dictamen de Riesgo {credit?.kycMaster?.dictamenRiesgo?.discrepancias?.length > 0 && <span className="discrepancy-badge">! {credit.kycMaster.dictamenRiesgo.discrepancias.length} Discrepancias</span>}</h4>
                            <p>{credit?.kycMaster?.dictamenRiesgo?.motivoSemaforo || 'Evaluación pendiente'}</p>
                        </div>
                    </div>
                    
                    <div className="quick-stats">
                        <div className="stat-item">
                            <span className="label">Monto Solicitado</span>
                            <span className="value">{formatMoney(credit?.monto_solicitado)}</span>
                        </div>
                        <div className="stat-item">
                            <span className="label">Plazo</span>
                            <span className="value">{credit?.plazo_meses} Meses</span>
                        </div>
                        <div className="stat-item">
                            <span className="label">Producto</span>
                            <span className="value">{credit?.tipo_credito || 'Personal'}</span>
                        </div>
                    </div>
                </div>

                <div className="actions-card">
                    <h3>Acciones de Decisión</h3>
                    <div className="action-buttons-group">
                        {credit?.estado === 'pendiente' && (
                            <>
                                <button 
                                    className="btn-approve-xl" 
                                    onClick={() => onAction('activo')}
                                    disabled={isSaving}
                                >
                                    <FiCheckCircle /> Aprobar Crédito
                                </button>
                                <button 
                                    className="btn-reject-xl" 
                                    onClick={() => onAction('rechazado')}
                                    disabled={isSaving}
                                >
                                    <FiX /> Rechazar Solicitud
                                </button>
                            </>
                        )}
                        {credit?.estado === 'activo' && (
                            <div className="active-status-msg">
                                <FiCheckCircle color="#27ae60" size={32} />
                                <p>Este crédito se encuentra actualmente <strong>Activo</strong>.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CondicionesTab = ({ formData, setFormData, calculos, onSave, isSaving }) => (
    <div className="tab-pane animate-fade">
        <div className="condiciones-grid">
            <div className="edit-form-section">
                <div className="input-group">
                    <label>Producto</label>
                    <select 
                        value={formData.tipo} 
                        onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                    >
                        <option value="personal">Préstamo Personal</option>
                        <option value="auto">Crédito Automotriz</option>
                    </select>
                </div>
                <div className="input-group">
                    <label>Monto Solicitado</label>
                    <input 
                        type="number" 
                        value={formData.monto} 
                        onChange={(e) => setFormData({...formData, monto: e.target.value})}
                    />
                </div>
                <div className="input-group">
                    <label>Plazo (Meses)</label>
                    <input 
                        type="number" 
                        value={formData.meses} 
                        onChange={(e) => setFormData({...formData, meses: e.target.value})}
                    />
                </div>
                <div className="input-group">
                    <label>Tasa Mensual ({(formData.tasa * 100).toFixed(2)}%)</label>
                    <input 
                        type="range" 
                        min="0" max="15" step="0.1"
                        value={formData.tasa * 100} 
                        onChange={(e) => setFormData({...formData, tasa: e.target.value / 100})}
                    />
                </div>
                <button className="btn-save-conditions" onClick={onSave} disabled={isSaving}>
                    {isSaving ? <FiRefreshCw className="spinner" /> : <FiSave />} Guardar Cambios
                </button>
            </div>

            <div className="proyeccion-card">
                <h3>Resumen de Pagos</h3>
                <div className="pago-row">
                    <span>Abono Quincenal (Año 1)</span>
                    <strong>{formatMoney(calculos.cuotaQuincenal1)}</strong>
                </div>
                <div className="pago-row">
                    <span>Abono Quincenal (Año 2+)</span>
                    <strong>{formatMoney(calculos.cuotaQuincenal2)}</strong>
                </div>
                <div className="pago-row total">
                    <span>Total a Liquidar</span>
                    <strong>{formatMoney(calculos.totalPagar)}</strong>
                </div>
            </div>
        </div>
    </div>
);

const PagosTab = ({ credit, onUpdate }) => {
    const { registerPayment, loading } = useCreditActions();
    const [monto, setMonto] = useState('');

    const handleAbono = async (e) => {
        e.preventDefault();
        if (!monto || monto <= 0) return;
        const res = await registerPayment(credit.id, monto);
        if (res.success) {
            setMonto('');
            onUpdate();
        }
    };

    const saldoPendiente = (credit.total_estimado || 0) - (credit.pagado || 0);

    return (
        <div className="tab-pane animate-fade">
            <div className="pagos-modal-grid">
                <div className="resumen-cobro-card">
                    <div className="pago-stat big">
                        <span>Total Pagado</span>
                        <strong>{formatMoney(credit.pagado || 0)}</strong>
                    </div>
                    <div className="pago-stat">
                        <span>Saldo Pendiente</span>
                        <strong>{formatMoney(saldoPendiente)}</strong>
                    </div>
                </div>

                <div className="registrar-pago-card">
                    <h3>Registrar Nuevo Abono</h3>
                    <form onSubmit={handleAbono}>
                        <div className="input-group">
                            <label>Monto a recibir</label>
                            <input 
                                type="number" 
                                placeholder="0.00" 
                                value={monto} 
                                onChange={(e) => setMonto(e.target.value)} 
                            />
                        </div>
                        <button type="submit" className="btn-confirm-payment" disabled={loading}>
                            {loading ? <FiRefreshCw className="spinner" /> : <FiPlus />} Confirmar Abono
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const DocumentosTab = ({ credit, onUpdate }) => {
    const { updateMultipleDocs, updateSingleDocStatus, addAdminDocument } = useDocumentTracking();
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [obs, setObs] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Estados para nuevo documento administrativo
    const [newDocData, setNewDocData] = useState({ nombre: '', url: '' });
    const [showAddForm, setShowAddForm] = useState(false);

    const toggleDoc = (docNombre) => {
        const d = credit.expediente.find(x => x.nombre === docNombre);
        if (d?.estatus?.toLowerCase() === 'aprobado') return; // Bloqueado
        setSelectedDocs(prev => prev.includes(docNombre) ? prev.filter(d => d !== docNombre) : [...prev, docNombre]);
    };

    const handleSingleAction = async (docNombre, status) => {
        setIsSubmitting(true);
        const res = await updateSingleDocStatus(credit.id, docNombre, status, obs);
        if (res.success) {
            onUpdate();
            setObs('');
        }
        setIsSubmitting(false);
    };

    const handleBatch = async (status) => {
        if (selectedDocs.length === 0) return;
        setIsSubmitting(true);
        const updates = selectedDocs.map(nombre => {
            const d = credit.expediente.find(x => x.nombre === nombre);
            return { tipo: d.tipo_documento, status };
        });
        await updateMultipleDocs(credit.id, updates, obs);
        onUpdate();
        setSelectedDocs([]);
        setIsSubmitting(false);
    };

    const handleAddAdminDoc = async (e) => {
        e.preventDefault();
        if (!newDocData.nombre || !newDocData.url) return;
        setIsSubmitting(true);
        const res = await addAdminDocument(credit.id, newDocData.nombre, newDocData.url);
        if (res.success) {
            onUpdate();
            setNewDocData({ nombre: '', url: '' });
            setShowAddForm(false);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="tab-pane animate-fade">
            <div className="docs-management-header">
                <div className="docs-actions-top">
                    <p><strong>{selectedDocs.length}</strong> seleccionados</p>
                    <div className="btn-group-mini">
                        <button className="btn-approve" onClick={() => handleBatch('aprobado')} disabled={isSubmitting || selectedDocs.length === 0}>
                            Aprobar Selección
                        </button>
                        <button className="btn-danger" onClick={() => handleBatch('rechazado')} disabled={isSubmitting || selectedDocs.length === 0}>
                            Rechazar Selección
                        </button>
                    </div>
                </div>
                
                <button className="btn-add-doc-trigger" onClick={() => setShowAddForm(!showAddForm)}>
                    {showAddForm ? <FiX /> : <FiPlus />} {showAddForm ? 'Cancelar' : 'Añadir Documento Administrativo'}
                </button>
            </div>

            {showAddForm && (
                <form className="admin-add-doc-form animate-fade-down" onSubmit={handleAddAdminDoc}>
                    <div className="input-group">
                        <label>Nombre del Documento</label>
                        <input 
                            type="text" 
                            placeholder="Ej. Contrato Firmado, Pagaré..." 
                            value={newDocData.nombre}
                            onChange={(e) => setNewDocData({...newDocData, nombre: e.target.value})}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>URL del Documento</label>
                        <input 
                            type="url" 
                            placeholder="https://firebasestorage.googleapis.com/..." 
                            value={newDocData.url}
                            onChange={(e) => setNewDocData({...newDocData, url: e.target.value})}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-submit-admin-doc" disabled={isSubmitting}>
                        {isSubmitting ? <FiRefreshCw className="spinner" /> : <FiUpload />} Guardar en Expediente
                    </button>
                </form>
            )}

            <textarea 
                placeholder="Observaciones para rechazo (general o individual)..." 
                value={obs} 
                onChange={(e) => setObs(e.target.value)}
                className="docs-obs-area"
            />

            <div className="docs-grid-modal">
                {credit?.expediente?.map((doc, i) => {
                    const est = doc.estatus?.toLowerCase().trim();
                    return (
                        <div 
                            key={i} 
                            className={`doc-card-premium ${selectedDocs.includes(doc.nombre) ? 'selected' : ''} ${doc.isAdmin ? 'is-admin' : ''}`}
                            onClick={() => doc.url && toggleDoc(doc.nombre)}
                        >
                            <div className="doc-card-status-indicator">
                                <span className={`status-dot ${est}`}></span>
                                {doc.isAdmin && <span className="admin-badge">ADMIN</span>}
                                {est === 'aprobado' && <span className="lock-badge"><FiLock /> BLOQUEADO</span>}
                            </div>

                            <div className="doc-card-body">
                                <h4>{doc.nombre}</h4>
                                <div className="doc-card-actions-row">
                                    {doc.url ? (
                                        <>
                                            <a href={doc.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="btn-view-doc">
                                                <FiEye /> Ver
                                            </a>
                                            {est !== 'aprobado' && (
                                                <div className="individual-status-btns">
                                                    <button 
                                                        className="btn-indiv approve" 
                                                        onClick={(e) => { e.stopPropagation(); handleSingleAction(doc.nombre, 'aprobado'); }}
                                                        disabled={isSubmitting}
                                                        title="Aprobar este documento"
                                                    >
                                                        <FiCheck />
                                                    </button>
                                                    <button 
                                                        className="btn-indiv reject" 
                                                        onClick={(e) => { e.stopPropagation(); handleSingleAction(doc.nombre, 'rechazado'); }}
                                                        disabled={isSubmitting || est === 'rechazado'}
                                                        title="Rechazar este documento"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <span className="pending-msg"><FiClock /> Esperando carga del usuario</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const AnalisisIATab = ({ credit }) => {
    const kyc = credit?.kycMaster;
    if (!kyc) return <div className="no-data-msg">No hay análisis de IA disponible para este crédito.</div>;

    return (
        <div className="tab-pane animate-fade">
            <div className="kyc-detailed-grid">
                <section className="kyc-section">
                    <h4><FiUsers /> Identidad</h4>
                    <p><strong>RDC:</strong> {kyc.perfilIdentidad?.rfc}</p>
                    <p><strong>CURP:</strong> {kyc.perfilIdentidad?.curp}</p>
                    <p><strong>Edad:</strong> {kyc.perfilIdentidad?.edadCalculada}</p>
                </section>
                <section className="kyc-section">
                    <h4><FiDollarSign /> Financiero</h4>
                    <p><strong>Ingresos:</strong> {formatMoney(kyc.perfilFinanciero?.ingresoMensualNeto)}</p>
                    <p><strong>Banco:</strong> {kyc.perfilFinanciero?.bancoPrincipal}</p>
                    <p><strong>Saldo Promedio:</strong> {formatMoney(kyc.perfilFinanciero?.saldoPromedioMensual)}</p>
                </section>
                <section className="kyc-section full">
                    <h4><FiAlertCircle /> Alertas de Fraude</h4>
                    {kyc.dictamenRiesgo?.alertasFraude?.length > 0 ? (
                        <ul>{kyc.dictamenRiesgo.alertasFraude.map((a, i) => <li key={i}>{a}</li>)}</ul>
                    ) : <p>No se detectaron alertas de seguridad.</p>}
                </section>
                {kyc.dictamenRiesgo?.discrepancias?.length > 0 && (
                    <section className="kyc-section full discrepancy">
                        <h4><FiAlertCircle /> Inconsistencias Documentales</h4>
                        <ul className="discrepancy-list">
                            {kyc.dictamenRiesgo.discrepancias.map((d, i) => (
                                <li key={i}>
                                    {typeof d === 'string' ? d : (
                                        <>
                                            <strong>{d.campo}:</strong> {d.diferencia} 
                                            <br />
                                            <small style={{opacity: 0.8}}>({d.documento1} vs {d.documento2})</small>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </div>
    );
};

const EtapasTab = ({ credit, onUpdate }) => {
    const currentFase = credit?.fase || 1;

    const handleAdvance = async () => {
        try {
            const docRef = doc(db, 'creditos', credit.id);
            await updateDoc(docRef, { 
                fase: currentFase + 1,
                [`metricasTiempos.finFase${currentFase}`]: new Date().toISOString(),
                [`metricasTiempos.inicioFase${currentFase + 1}`]: new Date().toISOString()
            });
            onUpdate();
        } catch (error) {
            console.error("Error advancing phase:", error);
        }
    };

    return (
        <div className="tab-pane animate-fade">
            <div className="etapas-control">
                <div className="current-phase-display">
                    Paso Actual: <strong>{CREDIT_STEPS.find(s => s.id === currentFase)?.label || 'Desconocido'}</strong>
                </div>
                <button 
                    className="btn-advance-phase" 
                    onClick={handleAdvance}
                    disabled={currentFase >= CREDIT_STEPS.length}
                >
                    <FiSend /> Avanzar a la Siguiente Etapa
                </button>
            </div>
            <div className="timeline-visual">
                {CREDIT_STEPS.map(step => (
                    <div key={step.id} className={`timeline-step-mini ${step.id <= currentFase ? 'completed' : ''} ${step.id === currentFase ? 'active' : ''}`}>
                        <div className="step-icon">{step.icon}</div>
                        <span>{step.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
