import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    FiX, FiEdit2, FiFileText, FiShield, FiTrendingUp, 
    FiCheckCircle, FiAlertCircle, FiClock, FiDollarSign,
    FiSave, FiRefreshCw, FiArrowLeft, FiSend, FiEye, FiDownload, FiPlus, FiPieChart,
    FiCheck, FiTrash2, FiUpload, FiUsers, FiLock, FiFolder, FiFolderPlus, FiChevronDown,
    FiChevronRight, FiFile, FiZap, FiList
} from 'react-icons/fi';
import { db, storage, functions } from '../../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useCreditActions } from '../../pages/hooks/useCreditActions';
import { useDocumentTracking } from '../../pages/hooks/useDocumentTracking';
import { formatMoney, calcularEstructuraCredito, generarTablaAmortizacion } from '../../utils/creditCalculations';
import { REGLAS_NEGOCIO } from '../../utils/Propiedades';
import { StatusModal } from '../Common/StatusModal';
import { CREDIT_STEPS } from '../../constants/creditSteps';
import { useAccountStatements } from '../../pages/hooks/useAccountStatements';
import { EstadoCuentaEditorModal } from './EstadoCuentaEditorModal';
import { useAuth } from '../../context/AuthContext';

import '../../assets/styles/CreditManagementModal.css';

// Definición de carpetas administrativas del expediente
const CARPETAS_EXPEDIENTE = [
    { id: 'Documentos',               icon: '👤', adminOnly: false, descripcion: 'Documentos subidos por el solicitante' },
    { id: 'Solicitud de Crédito',     icon: '📋', adminOnly: false, descripcion: 'Formato de autorización (Buró de Crédito)' },
    { id: 'Score BC',                 icon: '📊', adminOnly: true,  descripcion: 'Reporte de buró de crédito' },
    { id: 'Dictamen Legal',           icon: '⚖️', adminOnly: true,  descripcion: 'Dictamen del área jurídica' },
    { id: 'Cotización',               icon: '💰', adminOnly: true,  descripcion: 'Propuesta y tabla de amortización' },
    { id: 'Contrato',                 icon: '✍️', adminOnly: true,  descripcion: 'Contrato de crédito firmado' },
    { id: 'Búsqueda en Listas',       icon: '🔍', adminOnly: true,  descripcion: 'Validación en listas negras' },
    { id: 'Autorización Buró de C.',  icon: '🔐', adminOnly: true,  descripcion: 'Autorización firmada para consulta BC' },
    { id: 'Acta de Comité de Crédito',icon: '📝', adminOnly: true,  descripcion: 'Acta de resolución del comité' },
];

export const CreditManagementModal = ({ isOpen, creditId, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('resumen');
    const [credit, setCredit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const { updateCreditConditions, updateCreditStatus } = useCreditActions();
    const { updateMultipleDocs, updateSingleDocStatus, addAdminDocument, addMultipleFolderDocuments } = useDocumentTracking();

    const [formData, setFormData] = useState({
        monto: 0,
        meses: 0,
        tipo: 'personal',
        tasa: 0
    });

    const [statusModal, setStatusModal] = useState({ open: false, type: 'success', message: '' });
    const [showAmortization, setShowAmortization] = useState(false);

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
                let data = { id: docSnap.id, ...docSnap.data() };
                
                // MIGRACIÓN ON-THE-FLY: Si falta el grupo, lo buscamos en el usuario
                if (!data.usuario_grupo && data.usuario_id) {
                    const userRef = doc(db, 'usuarios', data.usuario_id);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists() && userSnap.data().grupo) {
                        data.usuario_grupo = userSnap.data().grupo;
                        // Actualizamos el documento en segundo plano para repararlo definitivamente
                        updateDoc(docRef, { usuario_grupo: data.usuario_grupo });
                    }
                }

                setCredit(data);
                
                const monto = Number(data.monto_solicitado) || 0;
                const tipo = data.tipo_credito?.toLowerCase().includes('auto') ? 'auto' : 'personal';
                const config = REGLAS_NEGOCIO[tipo] || REGLAS_NEGOCIO.personal;

                setFormData({
                    monto: monto,
                    meses: Number(data.plazo_meses) || 0,
                    tipo: tipo,
                    tasa: data.tasaMensual || config.tasaMensual,
                    plazoQuincenas: (Number(data.plazo_meses) || 0) * 2 
                });
            }
        } catch (error) {
            console.error("Error fetching credit:", error);
        } finally {
            setLoading(false);
        }
    };


    const calculos = useMemo(() => {
        // Adaptación al modelo de quincenas
        const totalQ = formData.meses * 2;
        return calcularEstructuraCredito(formData.monto, totalQ, formData.tipo, formData.tasa);
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
                            {activeTab === 'condiciones' && (
                                <CondicionesTab 
                                    formData={formData} 
                                    setFormData={setFormData} 
                                    calculos={calculos} 
                                    onSave={handleSaveConditions} 
                                    isSaving={isSaving} 
                                    onToggleTable={() => setShowAmortization(!showAmortization)}
                                />
                            )}
                            {showAmortization && (
                                <AmortizationView 
                                    monto={formData.monto} 
                                    plazoQ={formData.meses * 2} 
                                    tasa={formData.tasa} 
                                    onClose={() => setShowAmortization(false)}
                                />
                            )}
                             {activeTab === 'pagos' && <PagosTab credit={credit} onUpdate={fetchCreditData} />}
                            {activeTab === 'documentos' && <DocumentosTab credit={credit} onUpdate={fetchCreditData} />}
                            {activeTab === 'analisis' && <AnalisisIATab credit={credit} onUpdate={fetchCreditData} />}
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

const CondicionesTab = ({ formData, setFormData, calculos, onSave, isSaving, onToggleTable }) => (
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
                <div className="action-buttons-row">
                    <button className="btn-save-conditions" onClick={onSave} disabled={isSaving}>
                        {isSaving ? <FiRefreshCw className="spinner" /> : <FiSave />} Guardar Cambios
                    </button>
                    <button className="btn-view-amortization" onClick={onToggleTable}>
                        <FiList /> Ver Tabla
                    </button>
                </div>
            </div>

            <div className="proyeccion-card">
                <h3>Estructura HRH 2022</h3>
                <div className="pago-row">
                    <span>Fase A: Solo Int ({calculos.gracia} Q)</span>
                    <strong>{formatMoney(calculos.cuotaFaseA)}</strong>
                </div>
                <div className="pago-row">
                    <span>Fase B: Amortización Fix</span>
                    <strong>{formatMoney(calculos.cuotaFaseB)}</strong>
                </div>
                <div className="pago-row total">
                    <span>Costo Total del Crédito</span>
                    <strong>{formatMoney(calculos.totalPagar)}</strong>
                </div>
                <p className="notice-small">* Los primeros {calculos.gracia} pagos son intereses puros sin abono a capital.</p>
            </div>
        </div>
    </div>
);

const AmortizationView = ({ monto, plazoQ, tasa, onClose }) => {
    const table = useMemo(() => generarTablaAmortizacion(monto, plazoQ, tasa), [monto, plazoQ, tasa]);

    return (
        <div className="amortization-overlay animate-fade">
            <div className="amortization-modal">
                <header>
                    <h3>Tabla de Amortización</h3>
                    <button onClick={onClose}><FiX /></button>
                </header>
                <div className="table-scroll">
                    <table className="admin-table mini">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Fecha</th>
                                <th>Total Pago</th>
                                <th>Capital</th>
                                <th>Interés</th>
                                <th>IVA</th>
                                <th>Saldo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {table.map(row => (
                                <tr key={row.pagoN}>
                                    <td>{row.pagoN}</td>
                                    <td>{row.fecha}</td>
                                    <td className="bold">{formatMoney(row.cuota)}</td>
                                    <td>{formatMoney(row.capital)}</td>
                                    <td>{formatMoney(row.interes)}</td>
                                    <td>$0.00</td>
                                    <td className="bold">{formatMoney(row.saldo)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const PagosTab = ({ credit, onUpdate }) => {
    const { registerPayment, loading: paymentLoading } = useCreditActions();
    const { statements, uploadStatement, deleteStatement, loading: statementsLoading } = useAccountStatements(credit.id);
    const [monto, setMonto] = useState('');
    
    // Estados para subida de estado de cuenta
    const [file, setFile] = useState(null);
    const [customName, setCustomName] = useState('');
    const fileInputRef = useRef(null);

    const [showEstadoCuentaModal, setShowEstadoCuentaModal] = useState(false);
    const { user } = useAuth();

    const handleAbono = async (e) => {
        e.preventDefault();
        if (!monto || monto <= 0) return;
        const res = await registerPayment(credit.id, monto, null, credit.usuario_grupo);
        if (res.success) {
            setMonto('');
            onUpdate();
            setShowEstadoCuentaModal(true);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            // Sugerencia de nombre: Día-Mes-Año
            const hoy = new Date();
            const sugerencia = `Estado de Cuenta ${hoy.getDate()}-${hoy.getMonth() + 1}-${hoy.getFullYear()}`;
            setCustomName(sugerencia);
        }
    };

    const handleUploadStatement = async () => {
        if (!file) return;
        const res = await uploadStatement(file, customName);
        if (res.success) {
            setFile(null);
            setCustomName('');
            if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
            alert("Error al subir: " + res.message);
        }
    };

    const saldoPendiente = (credit.total_estimado || 0) - (credit.pagado || 0);

    return (
        <div className="tab-pane animate-fade">
            
            {statementsLoading && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    zIndex: 99999,
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    color: 'white', backdropFilter: 'blur(4px)'
                }}>
                    <FiRefreshCw className="spinner" size={64} style={{ marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Procesando Documento...</h2>
                    <p style={{ marginTop: '10px', fontSize: '16px', opacity: 0.8 }}>Por favor, no cierre ni recargue la página.</p>
                </div>
            )}

            <div className="pagos-modal-grid">
                <div className="column-left">
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
                        <h3><FiPlus /> Registrar Nuevo Abono</h3>
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
                            <button type="submit" className="btn-confirm-payment" disabled={paymentLoading}>
                                {paymentLoading ? <FiRefreshCw className="spinner" /> : <FiPlus />} Confirmar Abono
                            </button>
                        </form>
                    </div>
                </div>

                <div className="column-right">
                    <section className="account-statements-section" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--highlight)', marginBottom: '1.5rem' }}>
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3><FiFileText /> Emisión Oficial</h3>
                            <button 
                                onClick={() => setShowEstadoCuentaModal(true)}
                                style={{ background: 'var(--primary-color)', color: 'white', padding: '0.6rem 1.2rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Revisar/Generar Documento
                            </button>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Genera el estado de cuenta y envíalo automáticamente al portal del cliente.
                        </p>
                    </section>

                    <section className="account-statements-section">
                        <div className="section-header">
                            <h3><FiFileText /> Estados de Cuenta Generados</h3>
                        </div>

                        {/* Área de Carga */}
                        <div className="statement-upload-box">
                            <label className="upload-drop-area">
                                <input 
                                    type="file" 
                                    accept=".pdf" 
                                    hidden 
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />
                                {file ? (
                                    <div className="file-selected-info">
                                        <FiFileText size={24} />
                                        <div className="input-with-suggestion">
                                            <input 
                                                type="text" 
                                                value={customName} 
                                                onChange={(e) => setCustomName(e.target.value)}
                                                placeholder="Nombre del documento..."
                                            />
                                            <small>Puedes editar el nombre sugerido</small>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="no-file-msg">
                                        <FiUpload />
                                        <span>Click para anexar PDF</span>
                                    </div>
                                )}
                            </label>
                            {file && (
                                <div className="upload-actions">
                                    <button 
                                        className="btn-upload-confirm" 
                                        onClick={handleUploadStatement}
                                        disabled={statementsLoading}
                                    >
                                        {statementsLoading ? <FiRefreshCw className="spinner" /> : <FiCheck />} Subir Documento
                                    </button>
                                    <button className="btn-upload-cancel" onClick={() => { setFile(null); setCustomName(''); }}>
                                        <FiX /> Cancelar
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Listado de Estados de Cuenta */}
                        <div className="statements-list">
                            {statements.length > 0 ? (
                                statements.map(st => (
                                    <div key={st.id} className="statement-item-row">
                                        <div className="st-info">
                                            <FiFileText />
                                            <div className="st-text">
                                                <strong>{st.nombre}</strong>
                                                <span>{new Date(st.createdAt?.toDate?.() || st.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="st-actions">
                                            <a href={st.url} target="_blank" rel="noreferrer" className="btn-st-view">
                                                <FiEye />
                                            </a>
                                            <button className="btn-st-delete" onClick={() => deleteStatement(st.id, st.storagePath)}>
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-statements">
                                    <p>No se han emitido estados de cuenta para este crédito.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            <EstadoCuentaEditorModal 
                isOpen={showEstadoCuentaModal} 
                onClose={() => setShowEstadoCuentaModal(false)}
                credito={credit}
                user={user}
            />
        </div>
    );
};

const DocumentosTab = ({ credit, onUpdate }) => {
    const { updateSingleDocStatus, addFolderDocument, removeAdminDocument, addMultipleFolderDocuments } = useDocumentTracking();
    const [obs, setObs] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openFolders, setOpenFolders] = useState({ 'Documentos': true });
    const [uploading, setUploading] = useState(null); // nombre de carpeta que está subiendo
    const [analyzingFolder, setAnalyzingFolder] = useState(null); 
    const fileInputRefs = useRef({});

    // Agrupa los documentos del expediente por carpeta
    const docsPorCarpeta = useMemo(() => {
        const grouped = {};
        CARPETAS_EXPEDIENTE.forEach(c => { grouped[c.id] = []; });
        (credit?.expediente || []).forEach(d => {
            const carpeta = d.carpeta || 'Documentos';
            if (grouped[carpeta]) {
                grouped[carpeta].push(d);
            } else {
                grouped['Documentos'].push(d);
            }
        });
        return grouped;
    }, [credit?.expediente]);

    const handleAnalyzeFolder = async (e, carpetaId) => {
        e.stopPropagation();
        if (!credit?.id || !credit?.usuario_id) return;
        
        const folderDocs = docsPorCarpeta[carpetaId] || [];
        const baseDocs = docsPorCarpeta['Documentos'] || [];
        
        // Unimos los URLs de la carpeta actual con los de identidad base para contexto
        const allRelevantUrls = [
            ...baseDocs.map(d => d.url),
            ...folderDocs.map(d => d.url)
        ].filter(Boolean);

        if (allRelevantUrls.length === 0) {
            alert("No hay documentos válidos para analizar en esta carpeta.");
            return;
        }

        setAnalyzingFolder(carpetaId);
        try {
            const analizarFunc = httpsCallable(functions, 'analizarDocumentosGenerales');
            await analizarFunc({
                creditoId: credit.id,
                usuarioId: credit.usuario_id,
                documentUrls: [...new Set(allRelevantUrls)] // Evitar duplicados
            });
            onUpdate();
        } catch (err) {
            console.error('Error analizando carpeta con Gemini:', err);
            alert("Hubo un error al procesar el análisis con IA.");
        } finally {
            setAnalyzingFolder(null);
        }
    };

    const toggleFolder = (carpetaId) => {
        setOpenFolders(prev => ({ ...prev, [carpetaId]: !prev[carpetaId] }));
    };

    const handleSingleAction = async (docNombre, status) => {
        setIsSubmitting(true);
        await updateSingleDocStatus(credit.id, docNombre, status, obs);
        onUpdate();
        setObs('');
        setIsSubmitting(false);
    };

    const handleFolderUpload = async (e, carpetaId) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        setUploading(carpetaId);
        try {
            const uploadPromises = files.map(async (file) => {
                const ext = file.name.split('.').pop();
                const timestamp = Date.now();
                const randomId = Math.random().toString(36).substring(7);
                const storagePath = `expedientes/${credit.id}/admin/${carpetaId.replace(/\s+/g, '_')}/${file.name.replace(/\s+/g, '_')}_${timestamp}_${randomId}.${ext}`;
                const storageRef = ref(storage, storagePath);
                
                const snapshot = await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(snapshot.ref);
                
                return {
                    nombre: file.name.replace(/_\d+\.\w+$/, '').replace(/_/g, ' '),
                    url: downloadURL
                };
            });

            const uploadedDocs = await Promise.all(uploadPromises);
            await addMultipleFolderDocuments(credit.id, carpetaId, uploadedDocs);
            onUpdate();
        } catch (err) {
            console.error('Error subiendo archivos a carpeta:', err);
        } finally {
            setUploading(null);
            e.target.value = null;
        }
    };

    const handleRemoveFolderDoc = async (docNombre) => {
        if (!window.confirm(`¿Eliminar "${docNombre}" del expediente?`)) return;
        setIsSubmitting(true);
        await removeAdminDocument(credit.id, docNombre);
        onUpdate();
        setIsSubmitting(false);
    };

    return (
        <div className="tab-pane animate-fade">
            
            {uploading && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    zIndex: 99999,
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    color: 'white', backdropFilter: 'blur(4px)'
                }}>
                    <FiRefreshCw className="spinner" size={64} style={{ marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Procesando Documento...</h2>
                    <p style={{ marginTop: '10px', fontSize: '16px', opacity: 0.8 }}>Por favor, no cierre ni recargue la página.</p>
                </div>
            )}

            {/* Área de observaciones compartida */}
            <div className="folder-obs-row">
                <textarea
                    placeholder="Observaciones para rechazo de documentos del solicitante..."
                    value={obs}
                    onChange={(e) => setObs(e.target.value)}
                    className="docs-obs-area"
                    rows={2}
                />
            </div>

            <div className="expediente-folders-list">
                {CARPETAS_EXPEDIENTE.map((carpeta) => {
                    const docs = docsPorCarpeta[carpeta.id] || [];
                    const isOpen = !!openFolders[carpeta.id];
                    const tieneArchivos = docs.length > 0;

                    return (
                        <div key={carpeta.id} className={`folder-accordion ${isOpen ? 'open' : ''} ${tieneArchivos ? 'has-files' : ''}`}>
                            <div className="folder-accordion-header" onClick={() => toggleFolder(carpeta.id)}>
                                <div className="folder-header-left">
                                    <span className="folder-chevron">
                                        {isOpen ? <FiChevronDown /> : <FiChevronRight />}
                                    </span>
                                    <span className="folder-icon-emoji">{carpeta.icon}</span>
                                    <div className="folder-title-group">
                                        <span className="folder-title">{carpeta.id}</span>
                                        <span className="folder-desc">{carpeta.descripcion}</span>
                                    </div>
                                </div>
                                <div className="folder-header-right">
                                    {tieneArchivos && (
                                        <span className="folder-count-badge">{docs.length} archivo{docs.length > 1 ? 's' : ''}</span>
                                    )}
                                    <div className="folder-actions-group">
                                        {tieneArchivos && carpeta.id === 'Documentos' && (
                                            <button 
                                                className={`btn-ai-folder ${analyzingFolder === carpeta.id ? 'loading' : ''}`}
                                                onClick={(e) => handleAnalyzeFolder(e, carpeta.id)}
                                                disabled={!!analyzingFolder}
                                                title="Analizar con Gemini IA"
                                            >
                                                {analyzingFolder === carpeta.id ? <FiRefreshCw className="spinner" /> : <FiZap />}
                                                <span>AI</span>
                                            </button>
                                        )}
                                        {carpeta.adminOnly && (
                                            <label
                                                className={`btn-folder-upload ${uploading === carpeta.id ? 'loading' : ''}`}
                                                onClick={e => e.stopPropagation()}
                                                title={`Subir archivo a ${carpeta.id}`}
                                            >
                                                {uploading === carpeta.id ? <FiRefreshCw className="spinner" /> : <FiUpload />}
                                                <input
                                                    type="file"
                                                    hidden
                                                    multiple
                                                    accept=".pdf,.jpg,.jpeg,.png,.xlsx,.docx"
                                                    disabled={!!uploading || !!analyzingFolder}
                                                    onChange={(e) => handleFolderUpload(e, carpeta.id)}
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {isOpen && (
                                <div className="folder-accordion-body">
                                    {docs.length === 0 ? (
                                        <div className="folder-empty-state">
                                            {carpeta.adminOnly
                                                ? <><FiFolderPlus /><span>Carpeta vacía — usa el botón <FiUpload style={{verticalAlign:'middle'}}/> para agregar archivos</span></>
                                                : <><FiClock /><span>El solicitante aún no ha subido documentos en este expediente</span></>
                                            }
                                        </div>
                                    ) : (
                                        <div className="folder-files-list">
                                            {docs.map((d, i) => {
                                                const est = (d.estatus || 'pendiente').toLowerCase().trim();
                                                return (
                                                    <div key={i} className={`folder-file-row ${est}`}>
                                                        <div className="file-icon-name">
                                                            <FiFile className="file-icon" />
                                                            <span className="file-name">{d.nombre}</span>
                                                        </div>
                                                        <div className="file-actions">
                                                            <span className={`file-status-pill ${est}`}>{est}</span>
                                                            {d.url && (
                                                                <a href={d.url} target="_blank" rel="noreferrer" className="btn-indiv view-link" title="Ver documento">
                                                                    <FiEye />
                                                                </a>
                                                            )}
                                                            {!d.isAdmin && d.url && est !== 'aprobado' && (
                                                                <>
                                                                    <button
                                                                        className="btn-indiv approve"
                                                                        onClick={() => handleSingleAction(d.nombre, 'aprobado')}
                                                                        disabled={isSubmitting}
                                                                        title="Aprobar"
                                                                    ><FiCheck /></button>
                                                                    <button
                                                                        className="btn-indiv reject"
                                                                        onClick={() => handleSingleAction(d.nombre, 'rechazado')}
                                                                        disabled={isSubmitting}
                                                                        title="Rechazar"
                                                                    ><FiX /></button>
                                                                </>
                                                            )}
                                                            {d.isAdmin && (
                                                                <button
                                                                    className="btn-indiv reject"
                                                                    onClick={() => handleRemoveFolderDoc(d.nombre)}
                                                                    disabled={isSubmitting}
                                                                    title="Eliminar del expediente"
                                                                ><FiTrash2 /></button>
                                                            )}
                                                            {est === 'aprobado' && !d.isAdmin && (
                                                                <span className="lock-badge"><FiLock /> Bloqueado</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const AnalisisIATab = ({ credit, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const kyc = credit?.kycMaster;

    const handleGlobalAnalysis = async () => {
        if (!credit?.id || !credit?.usuario_id) return;
        
        // Obtenemos todos los documentos base (Documentos + Solicitud)
        const docsRequeridos = ['Identificación Oficial vigente', 'Comprobante de ingresos reciente', 'Comprobante de Domicilio', 'Solicitud de Crédito'];
        const urls = (credit.expediente || [])
            .filter(d => docsRequeridos.includes(d.nombre))
            .map(d => d.url)
            .filter(Boolean);

        if (urls.length < docsRequeridos.length) {
            if (!window.confirm("Aún faltan documentos base por subir. ¿Deseas ejecutar el análisis con lo que hay disponible?")) return;
        }

        setLoading(true);
        try {
            const analizarFunc = httpsCallable(functions, 'analizarDocumentosGenerales');
            await analizarFunc({
                creditoId: credit.id,
                usuarioId: credit.usuario_id,
                documentUrls: urls
            });
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Error en análisis global:', err);
            alert("Error al ejecutar el análisis de IA.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tab-pane animate-fade">
            <div className="ai-controls-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                    className={`btn-ai-trigger-global ${loading ? 'loading' : ''}`}
                    onClick={handleGlobalAnalysis}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        background: 'var(--primary-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    {loading ? <FiRefreshCw className="spinner" /> : <FiZap />}
                    {kyc ? 'Re-ejecutar Análisis IA' : 'Ejecutar Análisis IA Ahora'}
                </button>
            </div>

            {!kyc && !loading ? (
                <div className="no-data-msg">No hay análisis de IA disponible para este crédito. Haz clic en el botón superior para iniciar el análisis.</div>
            ) : (
                <div className="kyc-detailed-grid">
                    <section className="kyc-section">
                        <h4><FiUsers /> Identidad</h4>
                        <p><strong>Nombre:</strong> {kyc?.perfilIdentidad?.nombreCompleto}</p>
                        <p><strong>RFC:</strong> {kyc?.perfilIdentidad?.rfc}</p>
                        <p><strong>CURP:</strong> {kyc?.perfilIdentidad?.curp}</p>
                        <p><strong>Género:</strong> {kyc?.perfilIdentidad?.genero}</p>
                    </section>

                    <section className="kyc-section">
                        <h4><FiDollarSign /> Financiero</h4>
                        <p><strong>Ingresos:</strong> {formatMoney(kyc?.perfilFinanciero?.ingresoMensualNeto)}</p>
                        <p><strong>Patrón/Empresa:</strong> {kyc?.perfilFinanciero?.patronOEmpresa}</p>
                        <p><strong>Banco:</strong> {kyc?.perfilFinanciero?.bancoPrincipal}</p>
                    </section>

                    <section className="kyc-section full">
                        <h4><FiAlertCircle /> Dictamen y Seguridad</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                            <div className={`semaforo-pill ${kyc?.dictamenRiesgo?.semaforoConfiabilidad}`}>
                                {kyc?.dictamenRiesgo?.semaforoConfiabilidad} - {kyc?.dictamenRiesgo?.scoreKyc}/100
                            </div>
                        </div>
                        <p><strong>Conclusión:</strong> {kyc?.dictamenRiesgo?.motivoSemaforo}</p>
                        {kyc?.dictamenRiesgo?.alertasFraude?.length > 0 && (
                            <ul className="alert-list-styled">
                                {kyc.dictamenRiesgo.alertasFraude.map((a, i) => <li key={i}><FiAlertCircle /> {a}</li>)}
                            </ul>
                        )}
                    </section>

                    {kyc?.dictamenRiesgo?.discrepancias?.length > 0 && (
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
            )}
        </div>
    );
};

const EtapasTab = ({ credit, onUpdate }) => {
    const currentFase = credit?.fase || 1;

    const handleAdvance = async () => {
        try {
            const docRef = doc(db, 'creditos', credit.id);
            const now = new Date();
            
            await updateDoc(docRef, { 
                fase: currentFase + 1,
                [`metricasTiempos.finFase${currentFase}`]: now.toISOString(),
                [`metricasTiempos.inicioFase${currentFase + 1}`]: now.toISOString(),
                // Almacenamos el historial de pasos para el gráfico de tiempos promedios
                historialPasos: arrayUnion({
                    fase: currentFase + 1,
                    timestamp: new Date()
                })
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
