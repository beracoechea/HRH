import React, { useState, useMemo } from 'react';
import { 
    FiClock, FiCheckCircle, FiUploadCloud, 
    FiLoader, FiTrendingUp, FiFileText, FiChevronDown, FiChevronUp, FiPenTool,
    FiEye, FiTrash2, FiLock, FiFile, FiChevronRight, FiShield, FiDownload
} from 'react-icons/fi';
import { db, storage, functions } from '../../firebase/config'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

import { formatMoney, generarTablaAmortizacion } from '../../utils/creditCalculations';
import { StatusModal } from '../Common/StatusModal';
import { GeminiProcessingModal } from './GeminiProcessingModal';
import { BuroAutorizacionDocument } from './BuroAutorizacionDocument';
import { SolicitudCreditoDocument } from './SolicitudCreditoDocument';

import html2pdf from 'html2pdf.js';
import '../../assets/styles/UserCreditoCard.css';

// Carpetas del expediente — misma definición que admin para consistencia
const CARPETAS_EXPEDIENTE_USER = [
    { id: 'Documentos',                icon: '👤', adminOnly: false, label: 'Mis Documentos',            desc: 'Sube aquí tus documentos de identidad e ingresos' },
    { id: 'Solicitud de Crédito',      icon: '📋', adminOnly: false, label: 'Solicitud de Crédito y Buró', desc: 'Descarga y sube aquí tu solicitud y autorización de buró firmadas' },
    { id: 'Score BC',                  icon: '📊', adminOnly: true,  label: 'Score BC',                  desc: 'Resultado de tu evaluación crediticia' },
    { id: 'Dictamen Legal',            icon: '⚖️', adminOnly: true,  hiddenForUser: true, label: 'Dictamen Legal',            desc: 'Resolución del área jurídica' },
    { id: 'Cotización',                icon: '💰', adminOnly: true,  label: 'Cotización',                desc: 'Tu propuesta personalizada de crédito' },
    { id: 'Contrato',                  icon: '✍️', adminOnly: true,  label: 'Contrato',                  desc: 'Documentos contractuales' },
    { id: 'Búsqueda en Listas',        icon: '🔍', adminOnly: true,  hiddenForUser: true, label: 'Búsqueda en Listas',        desc: 'Validación de seguridad' },
    { id: 'Acta de Comité de Crédito', icon: '📝', adminOnly: true,  hiddenForUser: true, label: 'Acta de Comité de Crédito', desc: 'Resolución del comité' },
];


export const UserCreditoCard = ({ credito, expediente = [], onUploadSuccess }) => {
    const [uploading, setUploading] = useState(null);
    const [status, setStatus] = useState({ open: false, type: '', message: '' });
    const [showAmortization, setShowAmortization] = useState(false);
    const [showGeminiModal, setShowGeminiModal] = useState(false);
    const [openFolders, setOpenFolders] = useState({ 'Documentos': true });

    // El helper formatMoney ya está importado

    const totalEstimado = credito.total_estimado || 0;
    const pagado = credito.pagado || 0;
    const restante = totalEstimado - pagado;
    const porcentajeProgreso = totalEstimado > 0 ? Math.min((pagado / totalEstimado) * 100, 100) : 0;
    const esEstadoFinal = ['rechazado', 'aprobado', 'activo'].includes(credito.estado?.toLowerCase());

    // Agrupa documentos por carpeta
    const docsPorCarpeta = useMemo(() => {
        const grouped = {};
        CARPETAS_EXPEDIENTE_USER.forEach(c => { grouped[c.id] = []; });
        expediente.forEach(d => {
            const carpeta = d.carpeta || 'Documentos';
            if (grouped[carpeta]) {
                grouped[carpeta].push(d);
            } else {
                grouped['Documentos'].push(d);
            }
        });
        return grouped;
    }, [expediente]);

    const toggleFolder = (carpetaId) => {
        setOpenFolders(prev => ({ ...prev, [carpetaId]: !prev[carpetaId] }));
    };

    const tablaAmortizacion = useMemo(() => {
        return generarTablaAmortizacion(
            credito.monto_solicitado, 
            (credito.plazo_meses || 0) * 2, 
            credito.tasaMensual || 0.04
        );
    }, [credito]);

    const handleSignDocument = async (nombreDocumento) => {
        setUploading(nombreDocumento);
        try {
            const creditoRef = doc(db, "creditos", credito.id);
            const creditoSnap = await getDoc(creditoRef);
            if (creditoSnap.exists()) {
                const nuevoExpediente = creditoSnap.data().expediente.map(docExp =>
                    docExp.nombre === nombreDocumento
                        ? { ...docExp, estatus: 'firmado', fecha_firma: new Date().toISOString() }
                        : docExp
                );
                await updateDoc(creditoRef, { expediente: nuevoExpediente, lastUpdate: new Date() });
                const userRef = doc(db, "usuarios", credito.usuario_id);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const userExp = userSnap.data().expediente.map(docExp =>
                        docExp.nombre === nombreDocumento
                            ? { ...docExp, estatus: 'firmado', fecha_firma: new Date().toISOString() }
                            : docExp
                    );
                    await updateDoc(userRef, { expediente: userExp });
                }
            }
            setStatus({ open: true, type: 'success', message: `¡Documento "${nombreDocumento}" firmado correctamente!` });
            if (onUploadSuccess) await onUploadSuccess();
        } catch (error) {
            console.error("Error signing:", error);
            setStatus({ open: true, type: 'error', message: "Error al firmar documento." });
        } finally {
            setUploading(null);
        }
    };

    const handleRemoveDocument = async (nombreDocumento) => {
        const targetDoc = expediente.find(d => d.nombre === nombreDocumento);
        if (targetDoc?.isAdmin) {
            setStatus({ open: true, type: 'warning', message: "Este documento es administrativo y no puede ser eliminado." });
            return;
        }
        if (!window.confirm(`¿Estás seguro de que deseas eliminar el documento "${nombreDocumento}"?`)) return;
        setUploading(nombreDocumento);
        try {
            const creditoRef = doc(db, "creditos", credito.id);
            const creditoSnap = await getDoc(creditoRef);
            if (creditoSnap.exists()) {
                const nuevoExpediente = creditoSnap.data().expediente.map(docExp =>
                    docExp.nombre === nombreDocumento
                        ? { ...docExp, url: null, estatus: 'pendiente', fecha_remocion: new Date().toISOString() }
                        : docExp
                );
                await updateDoc(creditoRef, { expediente: nuevoExpediente, lastUpdate: new Date() });
                const userRef = doc(db, "usuarios", credito.usuario_id);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const userExp = userSnap.data().expediente.map(docExp =>
                        docExp.nombre === nombreDocumento ? { ...docExp, url: null, estatus: 'pendiente' } : docExp
                    );
                    await updateDoc(userRef, { expediente: userExp });
                }
            }
            setStatus({ open: true, type: 'success', message: "Documento eliminado correctamente." });
            if (onUploadSuccess) await onUploadSuccess();
        } catch (error) {
            console.error("Error removing:", error);
            setStatus({ open: true, type: 'error', message: "Error al eliminar documento." });
        } finally {
            setUploading(null);
        }
    };

    const handleFileChange = async (e, nombreDocumento) => {
        const file = e.target.files[0];
        if (!file) return;
        const targetDoc = expediente.find(d => d.nombre === nombreDocumento);
        if (targetDoc?.isAdmin) {
            setStatus({ open: true, type: 'warning', message: "Este documento es administrativo y no puede ser modificado." });
            return;
        }
        if (esEstadoFinal && credito.estado?.toLowerCase() !== 'activo') {
            setStatus({ open: true, type: 'error', message: `No se pueden subir documentos en estado ${credito.estado}.` });
            return;
        }
        setUploading(nombreDocumento);
        try {
            const fileExtension = file.name.split('.').pop();
            const storagePath = `expedientes/${credito.id}/${nombreDocumento.replace(/\s+/g, '_')}_${Date.now()}.${fileExtension}`;
            const storageRef = ref(storage, storagePath);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            const creditoRef = doc(db, "creditos", credito.id);
            const creditoSnap = await getDoc(creditoRef);
            if (creditoSnap.exists()) {
                const currentStatus = targetDoc?.estatus?.toLowerCase();
                const nuevoExpediente = creditoSnap.data().expediente.map(docExp =>
                    docExp.nombre === nombreDocumento
                        ? { ...docExp, url: downloadURL, estatus: 'revision', fecha_subida: new Date().toISOString() }
                        : docExp
                );
                await updateDoc(creditoRef, { expediente: nuevoExpediente, lastUpdate: new Date() });

                // OCR: solo documentos base (Documentos + Solicitud de Crédito)
                const docsBaseRequeridos = ['Identificación Oficial vigente', 'Comprobante de ingresos reciente', 'Comprobante de Domicilio', 'Solicitud de Crédito', 'Formato de autorización para solicitar reportes de crédito'];


                const docsUsuario = nuevoExpediente.filter(d => docsBaseRequeridos.includes(d.nombre));
                const todosSubidos = docsUsuario.length >= docsBaseRequeridos.length && docsUsuario.every(d => d.url && d.url.trim() !== '');
                
                if ((todosSubidos && (credito.fase === 1 || !credito.fase)) || currentStatus === 'rechazado') {
                    await runOCR(nuevoExpediente);
                }
            }
            setStatus({ open: true, type: 'success', message: `¡${nombreDocumento} subido!` });
            if (onUploadSuccess) await onUploadSuccess();
        } catch (error) {
            setStatus({ open: true, type: 'error', message: "Error al subir archivo." });
        } finally {
            setUploading(null);
            e.target.value = null;
        }
    };

    const handleDownloadTemplate = (nombreDocumento) => {
        const elementId = nombreDocumento === 'Formato de autorización para solicitar reportes de crédito' 
            ? 'buro-autorizacion-pdf' 
            : 'solicitud-credito-pdf';

            
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`Elemento ${elementId} no encontrado para descarga.`);
            return;
        }
        
        const filename = nombreDocumento.replace(/\s+/g, '_') + `_${credito.usuario_nombre?.replace(/\s+/g, '_') || 'Cliente'}.pdf`;
        
        const opt = {
            margin: 0,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true,
                logging: false,
                letterRendering: true,
                windowWidth: 1000 
            },
            jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' }
        };
        
        html2pdf().set(opt).from(element).save();
    };

    const runOCR = async (docsExpediente) => {
        setShowGeminiModal(true);
        setUploading('OCR_PROGRESS');
        try {
            const docsBaseRequeridos = ['Identificación Oficial vigente', 'Comprobante de ingresos reciente', 'Comprobante de Domicilio', 'Solicitud de Crédito', 'Formato de autorización para solicitar reportes de crédito'];

            const urls = docsExpediente
                .filter(d => docsBaseRequeridos.includes(d.nombre))
                .map(d => d.url)
                .filter(Boolean);

            const analizarFunc = httpsCallable(functions, 'analizarDocumentosGenerales');
            const res = await analizarFunc({
                creditoId: credito.id,
                usuarioId: credito.usuario_id,
                documentUrls: urls
            });
            const payload = res.data || {};
            if (credito.fase === 1 || !credito.fase) {
                const creditoRef = doc(db, "creditos", credito.id);
                await updateDoc(creditoRef, { fase: 2, lastUpdate: new Date() });
            }
            if (payload.requiresManualReview) {
                setStatus({ open: true, type: 'warning', message: payload.message || 'Se requiere revisión manual.' });
            } else {
                setStatus({ open: true, type: 'success', message: '¡Análisis completo IA! Ya puedes verificar tu información en el Paso 2.' });
            }
            if (onUploadSuccess) await onUploadSuccess();
        } catch (ocrError) {
            console.error('Error con OCR Gemini:', ocrError);
            setStatus({ open: true, type: 'error', message: 'Hubo un error analizando los documentos.' });
        } finally {
            setUploading(null);
            setShowGeminiModal(false);
        }
    };

    const docsUsuario = docsPorCarpeta['Documentos'] || [];
    const todosDocUploadeds = docsUsuario.length > 0 && docsUsuario.every(d => !!d.url);
    const requiresRetryOption = todosDocUploadeds && !credito.kycMaster && (credito.fase === 1 || !credito.fase);

    return (
        <div className={`user-credit-card animate-pop ${credito.estado?.toLowerCase()}`}>
            
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

            {/* --- CABECERA --- */}
            <div className="credit-header">
                <div className="amount-group">
                    <span className="label">Crédito {credito.tipo_credito}</span>
                    <p className="amount">{formatMoney(credito.monto_solicitado)}</p>
                </div>
                <div className={`badge-status ${(credito.estado || 'PENDIENTE').toLowerCase()}`}>
                    {(credito.estado || 'PENDIENTE').toUpperCase()}
                </div>
            </div>

            {/* --- PROGRESO DE PAGOS --- */}
            <div className="payment-tracking-section">
                <div className="tracking-header">
                    <span><FiTrendingUp /> Progreso</span>
                    <span className="percentage">{porcentajeProgreso.toFixed(1)}%</span>
                </div>
                <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${porcentajeProgreso}%` }}></div>
                </div>
                <div className="tracking-grid">
                    <div className="track-item">
                        <small>Pagado</small>
                        <p className="text-success">{formatMoney(pagado)}</p>
                    </div>
                    <div className="track-item">
                        <small>Restante</small>
                        <p>{formatMoney(restante)}</p>
                    </div>
                </div>
            </div>

            {/* --- TABLA DE AMORTIZACIÓN --- */}
            <div className="amortization-section">
                <button
                    className={`btn-toggle-amortization ${showAmortization ? 'active' : ''}`}
                    onClick={() => setShowAmortization(!showAmortization)}
                >
                    <div className="btn-label"><FiFileText /> <span>Tabla de Pagos</span></div>
                    {showAmortization ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {showAmortization && (
                    <div className="amortization-table-wrapper">
                        <table className="user-amort-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Fecha</th>
                                    <th>Pago</th>
                                    <th>Capital</th>
                                    <th>Saldo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tablaAmortizacion.map(row => (
                                    <tr key={row.pagoN} className={row.capital === 0 ? 'fase-gracia' : ''}>
                                        <td>{row.pagoN}</td>
                                        <td>{row.fecha.split('/')[0]}/{row.fecha.split('/')[1]}</td>
                                        <td className="bold">{formatMoney(row.cuota)}</td>
                                        <td>{formatMoney(row.capital)}</td>
                                        <td>{formatMoney(row.saldo)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* EXPEDIENTE */}
            <div className="expediente-section">
                <div className="expediente-header-row">
                    <h4 className="section-subtitle">EXPEDIENTE</h4>
                    {requiresRetryOption && (
                        <button onClick={() => runOCR(expediente)} disabled={uploading === 'OCR_PROGRESS'} className="btn-retry-ocr">
                            {uploading === 'OCR_PROGRESS' ? <FiLoader className="spinner" /> : <FiTrendingUp />} Reintentar IA
                        </button>
                    )}
                </div>

                <div className="user-folders-list">
                    {CARPETAS_EXPEDIENTE_USER.filter(c => !c.hiddenForUser).map((carpeta) => {
                        const docs = docsPorCarpeta[carpeta.id] || [];
                        const isOpen = !!openFolders[carpeta.id];
                        const archivosConUrl = docs.filter(d => d.url);
                        const tieneArchivos = archivosConUrl.length > 0;
                        const isUserFolder = !carpeta.adminOnly;

                        return (
                            <div key={carpeta.id} className={`user-folder-item ${isOpen ? 'open' : ''} ${carpeta.adminOnly ? 'admin-folder' : 'user-editable-folder'}`}>
                                <div className="user-folder-header" onClick={() => toggleFolder(carpeta.id)}>
                                    <div className="user-folder-header-left">
                                        <span className="user-folder-chevron">{isOpen ? <FiChevronDown /> : <FiChevronRight />}</span>
                                        <span className="user-folder-emoji">{carpeta.icon}</span>
                                        <div className="user-folder-info">
                                            <span className="user-folder-name">{carpeta.label}</span>
                                            <span className="user-folder-desc">{carpeta.desc}</span>
                                        </div>
                                    </div>
                                    <div className="user-folder-header-right">
                                        {tieneArchivos && <span className="user-folder-badge filled">{archivosConUrl.length} archivo{archivosConUrl.length > 1 ? 's' : ''}</span>}
                                        {carpeta.adminOnly && <FiShield className="admin-shield-icon" />}
                                    </div>
                                </div>

                                {isOpen && (
                                    <div className="user-folder-body">
                                        {isUserFolder ? (
                                            <div className="user-docs-list">
                                                {docs.length === 0 ? <p className="user-folder-empty">Carpeta vacía.</p> : docs.map((d, i) => {
                                                    const est = (d.estatus || 'pendiente').toLowerCase();
                                                    return (
                                                        <div key={i} className={`user-doc-row ${est}`}>
                                                            <div className="user-doc-left">
                                                                <FiFile className="user-doc-file-icon" />
                                                                <div>
                                                                    <span className="user-doc-name">{d.nombre}</span>
                                                                    <span className={`user-doc-status-tag ${est}`}>{est}</span>
                                                                </div>
                                                            </div>
                                                            <div className="user-doc-actions">
                                                                {est === 'aprobado' || est === 'validado' || est === 'firmado' ? (
                                                                    <>
                                                                        {d.url && <a href={d.url} target="_blank" rel="noreferrer" className="action-icon-btn view"><FiEye /></a>}
                                                                        <FiCheckCircle className="st-icon text-success" />
                                                                    </>
                                                                ) : d.url ? (
                                                                    <>
                                                                        <a href={d.url} target="_blank" rel="noreferrer" className="action-icon-btn view"><FiEye /></a>
                                                                        <button onClick={() => handleRemoveDocument(d.nombre)} className="action-icon-btn delete"><FiTrash2 /></button>
                                                                        <label className={`upload-btn mini ${uploading === d.nombre ? 'loading' : ''}`}>
                                                                            {uploading === d.nombre ? <FiLoader className="spinner" /> : <FiUploadCloud />}
                                                                            <input type="file" hidden onChange={(e) => handleFileChange(e, d.nombre)} accept=".pdf,.jpg,.jpeg,.png" />
                                                                        </label>
                                                                    </>
                                                                ) : (d.nombre === 'Solicitud de Crédito' || d.nombre === 'Formato de autorización para solicitar reportes de crédito') ? (

                                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                                        <button onClick={() => handleDownloadTemplate(d.nombre)} className="action-icon-btn view" title="Descargar Formato"><FiDownload /></button>
                                                                        <label className={`upload-btn ${uploading === d.nombre ? 'loading' : ''}`}>
                                                                            {uploading === d.nombre ? <FiLoader className="spinner" /> : <FiUploadCloud />}
                                                                            <input type="file" hidden onChange={(e) => handleFileChange(e, d.nombre)} accept=".pdf,.jpg,.jpeg,.png" />
                                                                        </label>
                                                                    </div>

                                                                ) : (
                                                                    <label className={`upload-btn ${uploading === d.nombre ? 'loading' : ''}`}>
                                                                        {uploading === d.nombre ? <FiLoader className="spinner" /> : <FiUploadCloud />}
                                                                        <input type="file" hidden onChange={(e) => handleFileChange(e, d.nombre)} accept=".pdf,.jpg,.jpeg,.png" />
                                                                    </label>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="admin-docs-readonly-list">
                                                {archivosConUrl.length === 0 ? <p className="admin-folder-empty">Pendiente por el asesor.</p> : archivosConUrl.map((d, i) => (
                                                    <div key={i} className="admin-readonly-file-row">
                                                        <div className="admin-file-left"><FiFile /> <span>{d.nombre}</span></div>
                                                        <a href={d.url} target="_blank" rel="noreferrer" className="btn-view-admin-doc"><FiEye /> Ver</a>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <StatusModal isOpen={status.open} type={status.type} message={status.message} onClose={() => setStatus({ ...status, open: false })} />
            <GeminiProcessingModal isOpen={showGeminiModal} />

            {/* Templates OCULTOS para generación de PDF */}
            <div style={{ position: 'relative', height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: 0, left: 0 }}>
                    <BuroAutorizacionDocument 
                        id="buro-autorizacion-pdf" 
                        userData={{
                            nombreCompleto: credito.kycMaster?.perfilIdentidad?.nombreCompleto || credito.usuario_nombre,
                            rfc: credito.kycMaster?.perfilIdentidad?.rfc || '',
                            curp: credito.kycMaster?.perfilIdentidad?.curp || '',
                            calle: credito.kycMaster?.perfilDireccion?.calle || '',
                            numExt: credito.kycMaster?.perfilDireccion?.numeroExterior || '',
                            numInt: credito.kycMaster?.perfilDireccion?.numeroInterior || '',
                            colonia: credito.kycMaster?.perfilDireccion?.colonia || '',
                            municipio: credito.kycMaster?.perfilDireccion?.municipioDelegacion || '',
                            estado: credito.kycMaster?.perfilDireccion?.estado || '',
                            cp: credito.kycMaster?.perfilDireccion?.codigoPostal || '',
                            telefono: credito.kycMaster?.perfilContacto?.telefono || ''
                        }} 
                    />
                </div>
                <div style={{ position: 'absolute', top: 0, left: 0 }}>
                    <SolicitudCreditoDocument 
                        id="solicitud-credito-pdf" 
                        userData={{
                            nombreCompleto: credito.kycMaster?.perfilIdentidad?.nombreCompleto || credito.usuario_nombre,
                            rfc: credito.kycMaster?.perfilIdentidad?.rfc || '',
                            curp: credito.kycMaster?.perfilIdentidad?.curp || '',
                            calle: credito.kycMaster?.perfilDireccion?.calle || '',
                            numExt: credito.kycMaster?.perfilDireccion?.numeroExterior || '',
                            numInt: credito.kycMaster?.perfilDireccion?.numeroInterior || '',
                            colonia: credito.kycMaster?.perfilDireccion?.colonia || '',
                            municipio: credito.kycMaster?.perfilDireccion?.municipioDelegacion || '',
                            estado: credito.kycMaster?.perfilDireccion?.estado || '',
                            cp: credito.kycMaster?.perfilDireccion?.codigoPostal || '',
                            telefono: credito.kycMaster?.perfilContacto?.telefono || ''
                        }} 
                    />
                </div>
            </div>


        </div>
    );
};