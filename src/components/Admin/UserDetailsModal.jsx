import React, { useState, useEffect } from 'react';
import {
    FiX, FiUser, FiMail, FiShield, FiFileText,
    FiCheckCircle, FiInfo, FiEdit, FiUpload, FiDownload, FiActivity,
    FiDollarSign, FiCalendar, FiMapPin, FiPhone, FiBriefcase, FiSave, FiPenTool,
    FiAlertCircle, FiTrendingUp, FiSearch, FiFlag, FiCreditCard, FiRefreshCw, FiCheck, FiEye, FiZap
} from 'react-icons/fi';
import { CREDIT_STEPS } from '../../constants/creditSteps';
import { formatMoney } from '../../utils/creditCalculations';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../firebase/config';
import { useAdminUserActions } from '../../pages/hooks/useAdminUserActions';
import { useAuthActions } from '../../pages/hooks/useAuthActions';
import { useDocumentTracking } from '../../pages/hooks/useDocumentTracking';
import { StatusModal } from '../Common/StatusModal';
import { GroupAssignmentModal } from './GroupAssignmentModal';
import { StatusPill } from '../Common/StatusPill';
import { TrafficLight } from './common/TrafficLight';
import { KycItem } from './common/KycItem';

import '../../assets/styles/UserDetailsModal.css';

export const UserDetailsModal = ({ isOpen, user, creditos = [], citas = [], onUpdateRole, onClose }) => {
    const [activeTab, setActiveTab] = useState('kyc');
    const [editingKYC, setEditingKYC] = useState(false);
    const [editingRole, setEditingRole] = useState(false);
    const [groupModalOpen, setGroupModalOpen] = useState(false);
    const [kycForm, setKycForm] = useState({
        nombreCompleto: '', curp: '', rfc: '', telefono: '',
        fechaNacimiento: '', genero: '', ingresos: 0,
        domicilio: '', ocupacion: '', paisNacimiento: 'MÉXICO',
        entidadNacimiento: '', correo: ''
    });
    const [aiData, setAiData] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);

    const fileInputRef = React.useRef();
    const signatureInputRef = React.useRef();

    const { 
        uploadUserDoc, updateUserKYC, updateUserPhase, 
        updateUserAdminData, uploading, actionStatus, closeActionStatus 
    } = useAdminUserActions(onUpdateRole);
    const { loading: authLoading } = useAuthActions(onUpdateRole);
    const { updateSingleDocStatus } = useDocumentTracking();
    const [analyzing, setAnalyzing] = useState(false);

    const handleManualAnalysis = async () => {
        if (!user || !lastCredit) return;
        setAnalyzing(true);
        try {
            const docsBaseRequeridos = ['Identificación Oficial vigente', 'Comprobante de ingresos reciente', 'Comprobante de Domicilio', 'Solicitud de Crédito'];
            const urls = (lastCredit.expediente || [])
                .filter(d => docsBaseRequeridos.includes(d.nombre))
                .map(d => d.url)
                .filter(Boolean);

            if (urls.length < docsBaseRequeridos.length) {
                if (!window.confirm("Faltan documentos base. ¿Ejecutar análisis con lo disponible?")) {
                    setAnalyzing(false);
                    return;
                }
            }

            const analizarFunc = httpsCallable(functions, 'analizarDocumentosGenerales');
            await analizarFunc({
                creditoId: lastCredit.id,
                usuarioId: user.id,
                documentUrls: urls
            });
            if (onUpdateRole) onUpdateRole();
        } catch (err) {
            console.error("Error en análisis manual:", err);
            alert("Error al procesar el análisis.");
        } finally {
            setAnalyzing(false);
        }
    };

    // Filtramos datos del usuario actual
    const userCreditos = creditos.filter(c => c.usuario_id === user?.id);
    const lastCredit = userCreditos[0];

    useEffect(() => {
        const loadFullData = async () => {
            if (user && isOpen) {
                setLoadingAI(true);
                try {
                    // 1. Obtener perfil maestro (base)
                    const kycDocRef = doc(db, "usuarios", user.id, "perfil", "kyc");
                    const kycSnap = await getDoc(kycDocRef);
                    let profileKyc = kycSnap.exists() ? kycSnap.data() : {};

                    // 2. Si hay crédito, obtener datos específicos
                    if (lastCredit?.id) {
                        const creditRef = doc(db, "creditos", lastCredit.id);
                        const snap = await getDoc(creditRef);
                        
                        if (snap.exists()) {
                            const creditData = snap.data();
                            const m = creditData.kycMaster || {};
                            setAiData(creditData.kycMaster || null);

                            // El correo y teléfono SIEMPRE deben venir de la solicitud de crédito para el administrador
                            const contactInfo = {
                                telefono: creditData.telefono_contacto || user.telefono || '',
                                correo: creditData.usuario_email || user.email || ''
                            };

                            // Consolidamos datos confirmados (datosKYC) con respaldo en IA (m.perfilIdentidad)
                            const confirmedKyc = creditData.datosKYC || profileKyc;
                            
                            setKycForm({
                                nombreCompleto: confirmedKyc.nombreCompleto || m.perfilIdentidad?.nombreCompleto || '',
                                curp: confirmedKyc.curp || m.perfilIdentidad?.curp || '',
                                rfc: confirmedKyc.rfc || m.perfilIdentidad?.rfc || '',
                                fechaNacimiento: confirmedKyc.fechaNacimiento || m.perfilIdentidad?.fechaNacimiento || '',
                                genero: confirmedKyc.genero || m.perfilIdentidad?.genero || '',
                                ingresos: confirmedKyc.ingresos || m.perfilFinanciero?.ingresoMensualNeto || 0,
                                domicilio: confirmedKyc.domicilio || m.analisisDomicilio?.direccionFinalConsolidada || '',
                                ocupacion: confirmedKyc.ocupacion || m.perfilFinanciero?.patronOEmpresa || '',
                                entidadNacimiento: confirmedKyc.entidadNacimiento || m.perfilIdentidad?.entidadNacimiento || '',
                                paisNacimiento: confirmedKyc.paisNacimiento || m.perfilIdentidad?.paisNacimiento || 'MÉXICO',
                                ...contactInfo
                            });
                        }
                    } else if (kycSnap.exists()) {
                        // Si no hay crédito, usamos lo que haya en el perfil
                        setKycForm(prev => ({ ...prev, ...profileKyc }));
                    }
                } catch (err) {
                    console.error("Error cargando expediente:", err);
                } finally {
                    setLoadingAI(false);
                }
            }
        };
        loadFullData();
    }, [user, isOpen, lastCredit?.id]);

    // Gestión individual de documentos dentro del array 'expediente' del crédito
    const handleDocumentStatus = async (creditoId, docNombre, newStatus) => {
        const res = await updateSingleDocStatus(creditoId, docNombre, newStatus);
        if (res.success && onUpdateRole) onUpdateRole();
    };

    if (!isOpen || !user) return null;

    const handleKycChange = (e) => {
        const { name, value } = e.target;
        const skipUppercase = ['telefono', 'fechaNacimiento', 'ingresos', 'correo'];
        setKycForm(prev => ({ ...prev, [name]: skipUppercase.includes(name) ? value : value.toUpperCase() }));
    };

    const saveKycEdits = async () => {
        // Guardamos tanto en el crédito como en el perfil
        const success = await updateUserKYC(user.id, kycForm, lastCredit?.id);
        if (success) setEditingKYC(false);
    };

    const getRoleClass = (rol) => {
        const roles = { admin: 'role-admin', rh: 'role-rh', analista: 'role-analista', aprobador: 'role-aprobador', tesorero: 'role-tesorero', marketing: 'role-marketing', cliente: 'role-cliente' };
        return roles[rol?.toLowerCase()] || 'role-cliente';
    };

    const formatFecha = (ts) => {
        if (!ts) return 'N/A';
        const date = ts.toDate ? ts.toDate() : new Date(ts);
        return date.toLocaleDateString();
    };

    return (
        <div className="modal-overlay active" onClick={onClose}>
            <div className="user-details-modal animate-pop" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <div className="user-info-main">
                        <div className="avatar-large">{user.email?.charAt(0).toUpperCase()}</div>
                        <div className="user-meta">
                            <h2>{user.nombre || 'Revisión de Expediente'}</h2>
                            <span><FiMail /> {user.email}</span>
                        </div>
                    </div>
                    <button className="btn-close-modal" onClick={onClose}><FiX /></button>
                </header>

                <nav className="modal-tabs">
                    <button className={`tab-btn ${activeTab === 'kyc' ? 'active' : ''}`} onClick={() => setActiveTab('kyc')}><FiUser /> Perfil & IA</button>
                    <button className={`tab-btn ${activeTab === 'creditos' ? 'active' : ''}`} onClick={() => setActiveTab('creditos')}><FiDollarSign /> Créditos</button>
                    <button className={`tab-btn ${activeTab === 'expediente' ? 'active' : ''}`} onClick={() => setActiveTab('expediente')}><FiFileText /> Expediente</button>
                    <button className={`tab-btn ${activeTab === 'proceso' ? 'active' : ''}`} onClick={() => setActiveTab('proceso')}><FiActivity /> Flujo</button>
                </nav>

                <div className="modal-body">
                    {/* --- TAB PERFIL & IA --- */}
                    {activeTab === 'kyc' && (
                        <div className="tab-pane animate-fade">
                            <div className="kyc-grid-layout">
                                <div className="info-column">
                                    <section className="modal-section" style={{ borderLeft: '4px solid var(--primary-color)' }}>
                                        <div className="section-title">
                                            <span><FiShield /> Configuración Administrativa</span>
                                        </div>

                                        <div className="admin-config-box">
                                            {/* GESTIÓN DE ROL */}
                                            <div className="admin-field-group">
                                                <label>Rol de Acceso</label>
                                                <div className="admin-input-wrapper">
                                                    <select
                                                        className={`role-badge-large ${getRoleClass(user.rol)}`}
                                                        value={user.rol || 'cliente'}
                                                        onChange={async (e) => {
                                                            await updateUserAdminData(user.id, user.email, { rol: e.target.value, grupo: user.grupo });
                                                        }}
                                                        disabled={uploading}
                                                    >
                                                        <option value="cliente">Cliente</option>
                                                        <option value="marketing">Marketing</option>
                                                        <option value="tesorero">Tesorero</option>
                                                        <option value="rh">Recursos Humanos (RH)</option>
                                                        <option value="analista">Analista / Riesgos</option>
                                                        <option value="aprobador">Aprobador</option>
                                                        <option value="admin">Administrador</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* GESTIÓN DE GRUPO/SOCIO - AHORA INDEPENDIENTE */}
                                            <div className="admin-field-group">
                                                <label>Grupo / Socio Asignado</label>
                                                <div className="admin-input-wrapper">
                                                    <div className="user-group-tag" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <span>{user.grupo || 'Sin Grupo'}</span>
                                                        <button
                                                            className="btn-edit-round-premium"
                                                            onClick={() => setGroupModalOpen(true)}
                                                            disabled={uploading}
                                                        >
                                                            <FiPenTool size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <small style={{ fontSize: '0.65rem', color: '#64748b' }}>
                                                    * Define el alcance de visibilidad de datos para este usuario.
                                                </small>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                <div className="kyc-column">
                                    <section className="modal-section">
                                        <div className="section-title">
                                            <FiCheckCircle color="var(--primary-color)" />
                                            <span>Información KYC Detectada</span>
                                            {!editingKYC ? (
                                                <button className="btn-edit-text" onClick={() => setEditingKYC(true)}><FiEdit /> Editar</button>
                                            ) : (
                                                <button className="btn-save-text" onClick={saveKycEdits}><FiSave /> Guardar</button>
                                            )}
                                        </div>
                                        <div className="kyc-form-grid">
                                            <KycItem label="Nombre Completo" name="nombreCompleto" value={kycForm.nombreCompleto} editing={editingKYC} onChange={handleKycChange} icon={<FiUser />} />
                                            <KycItem label="CURP" name="curp" value={kycForm.curp} editing={editingKYC} onChange={handleKycChange} icon={<FiFileText />} />
                                            <KycItem label="RFC" name="rfc" value={kycForm.rfc} editing={editingKYC} onChange={handleKycChange} icon={<FiFileText />} />
                                            <KycItem label="WhatsApp" name="telefono" value={kycForm.telefono} editing={editingKYC} type="tel" onChange={handleKycChange} icon={<FiPhone />} />
                                            <KycItem label="Correo" name="correo" value={kycForm.correo} editing={editingKYC} type="email" onChange={handleKycChange} icon={<FiMail />} />
                                            <KycItem label="Fecha Nac." name="fechaNacimiento" value={kycForm.fechaNacimiento} editing={editingKYC} type="date" onChange={handleKycChange} icon={<FiCalendar />} />
                                            <KycItem label="Género" name="genero" value={kycForm.genero} editing={editingKYC} onChange={handleKycChange} icon={<FiUser />} />
                                            <KycItem label="País Nac." name="paisNacimiento" value={kycForm.paisNacimiento} editing={editingKYC} onChange={handleKycChange} icon={<FiFlag />} />
                                            <KycItem label="Entidad Nac." name="entidadNacimiento" value={kycForm.entidadNacimiento} editing={editingKYC} onChange={handleKycChange} icon={<FiMapPin />} />
                                            <KycItem label="Ingresos" name="ingresos" value={formatMoney(kycForm.ingresos)} editing={editingKYC} onChange={handleKycChange} icon={<FiDollarSign />} />
                                        </div>

                                        {/* Reporte IA Gemini 2.5 */}
                                        <div className="section-title" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span><FiTrendingUp /> Análisis IA</span>
                                            {lastCredit && (
                                                <button 
                                                    className={`btn-ai-trigger-mini ${analyzing ? 'loading' : ''}`}
                                                    onClick={handleManualAnalysis}
                                                    disabled={analyzing}
                                                    style={{
                                                        padding: '6px 12px',
                                                        fontSize: '0.75rem',
                                                        background: 'var(--primary-color)',
                                                        color: 'white',
                                                        borderRadius: '20px',
                                                        border: 'none',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {analyzing ? <FiRefreshCw className="spinner" size={12} /> : <FiZap size={12} />}
                                                    {aiData ? 'Actualizar' : 'Analizar ahora'}
                                                </button>
                                            )}
                                        </div>

                                        {aiData && (
                                            <div className="ai-report-card">
                                                <div className="ai-report-header">
                                                    <span className="ai-title"><FiTrendingUp /> ANALISIS DE RIESGO 360°</span>
                                                    <TrafficLight score={aiData.dictamenRiesgo?.scoreKyc} semaforo={aiData.dictamenRiesgo?.semaforoConfiabilidad} />
                                                </div>
                                                <div className="ai-report-content">
                                                    <div className="ai-grid-box">
                                                        <h5><FiMapPin /> Domicilio Forense</h5>
                                                        <p className="ai-val">{aiData.analisisDomicilio?.direccionFinalConsolidada}</p>
                                                        <span className={`ai-match-tag ${aiData.analisisDomicilio?.coincidenciaDocumental ? 'match' : 'mismatch'}`}>
                                                            {aiData.analisisDomicilio?.coincidenciaDocumental ? 'COINCIDE' : 'DISCREPANCIA'}
                                                        </span>
                                                    </div>
                                                    <div className="ai-full-box highlight">
                                                        <h5><FiFlag /> Dictamen Final IA</h5>
                                                        <p className="ai-conclusion">{aiData.dictamenRiesgo?.motivoSemaforo}</p>
                                                    </div>

                                                    {aiData.dictamenRiesgo?.discrepancias?.length > 0 && (
                                                        <div className="ai-full-box discrepancy">
                                                            <h5><FiAlertCircle /> Inconsistencias Detectadas</h5>
                                                            <ul className="ai-discrepancy-list">
                                                                {aiData.dictamenRiesgo.discrepancias.map((d, i) => (
                                                                    <li key={i}>
                                                                        {typeof d === 'string' ? d : (
                                                                            <>
                                                                                <strong>{d.campo}:</strong> {d.diferencia}
                                                                                <br />
                                                                                <small style={{ opacity: 0.7 }}>({d.documento1} vs {d.documento2})</small>
                                                                            </>
                                                                        )}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </section>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB CRÉDITOS --- */}
                    {activeTab === 'creditos' && (
                        <div className="tab-pane animate-fade">
                            <div className="credits-history-list">
                                {userCreditos.map(c => (
                                    <div key={c.id} className="credit-card-mini">
                                        <div className="cred-top">
                                            <strong>{c.tipo_credito}</strong>
                                            <StatusPill status={c.estado} />
                                        </div>
                                        <div className="cred-details">
                                            <span>Monto: {formatMoney(c.monto_solicitado)}</span>
                                            <span>Folio: #{c.id.slice(-6).toUpperCase()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- TAB EXPEDIENTE (AQUÍ ESTÁ EL LISTADO CON ACCIONES) --- */}
                    {activeTab === 'expediente' && (
                        <div className="tab-pane animate-fade">
                            <div className="expedientes-grouped-list">
                                {userCreditos.map((credito) => (
                                    <div key={credito.id} className="credito-expediente-group-admin">
                                        <div className="group-header-admin">
                                            <div className="folio-info">
                                                <span className="folio-number">FOLIO #{credito.id.slice(-6).toUpperCase()}</span>
                                                <span className="folio-type">{credito.tipo_credito}</span>
                                            </div>
                                            <StatusPill status={credito.estado} />
                                        </div>

                                        <table className="admin-docs-table">
                                            <thead>
                                                <tr>
                                                    <th>Documento</th>
                                                    <th>Estatus</th>
                                                    <th style={{ textAlign: 'right' }}>Validación</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {credito.expediente?.map((doc, idx) => (
                                                    <tr key={idx} className="admin-doc-row">
                                                        <td>
                                                            <div className="doc-name-cell">
                                                                <FiFileText /> <span>{doc.nombre}</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className={`doc-status-tag ${doc.estatus?.toLowerCase()}`}>
                                                                {doc.estatus}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="admin-doc-actions">
                                                                <a href={doc.url} target="_blank" rel="noreferrer" className="btn-doc-view"><FiEye /></a>
                                                                <button className="btn-doc-approve" onClick={() => handleDocumentStatus(credito.id, doc.nombre, 'aprobado')}><FiCheck /></button>
                                                                <button className="btn-doc-reject" onClick={() => handleDocumentStatus(credito.id, doc.nombre, 'rechazado')}><FiX /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- TAB PROCESO --- */}
                    {activeTab === 'proceso' && (
                        <div className="tab-pane animate-fade">
                            <div className="stepper-visual">
                                {CREDIT_STEPS.map(step => {
                                    const current = lastCredit?.fase || 1;
                                    const done = current > step.id;
                                    const active = current === step.id;
                                    return (
                                        <div key={step.id} className={`step-item ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                                            <div className="step-circle">{done ? <FiCheckCircle /> : step.id}</div>
                                            <div className="step-content">
                                                <span className="step-name">{step.label}</span>
                                                {active && (
                                                    <button className="btn-advance-step" onClick={() => updateUserPhase(lastCredit.id, step.id + 1)}>
                                                        Avanzar a Paso {step.id + 1}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <footer className="modal-footer">
                    <button className="btn-close-full" onClick={onClose}>Cerrar Expediente</button>
                </footer>
            </div>
            <StatusModal isOpen={actionStatus.open} type={actionStatus.type} message={actionStatus.message} onClose={closeActionStatus} />

            <GroupAssignmentModal
                isOpen={groupModalOpen}
                currentGroup={user.grupo}
                onSelect={(newGroup) => {
                    updateUserAdminData(user.id, user.email, { rol: user.rol || 'cliente', grupo: newGroup });
                }}
                onClose={() => setGroupModalOpen(false)}
            />
        </div>
    );
};

const DocRow = ({ doc }) => (
    <div className="doc-row">
        <div className="doc-info-mini">
            <FiFileText className="doc-icon" />
            <div><span className="name">{doc.nombre}</span><span className={`status ${doc.estatus?.toLowerCase().replace(' ', '_')}`}>{doc.estatus}</span></div>
        </div>
        <div className="doc-actions">{doc.url && <a href={doc.url} target="_blank" rel="noopener noreferrer" className="btn-view"><FiDownload /></a>}</div>
    </div>
);