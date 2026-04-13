import React, { useState } from 'react';
import { 
    FiClock, FiCheckCircle, FiUploadCloud, 
    FiLoader, FiTrendingUp, FiFileText, FiChevronDown, FiChevronUp, FiPenTool,
    FiEye, FiTrash2, FiLock
} from 'react-icons/fi';
import { db, storage, functions } from '../../firebase/config'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

import { StatusModal } from '../Common/StatusModal';
import { GeminiProcessingModal } from './GeminiProcessingModal';
import '../../assets/styles/UserCreditoCard.css';

export const UserCreditoCard = ({ credito, expediente = [], onUploadSuccess }) => {
    const [uploading, setUploading] = useState(null);
    const [status, setStatus] = useState({ open: false, type: '', message: '' });
    const [showAmortization, setShowAmortization] = useState(false);
    const [showGeminiModal, setShowGeminiModal] = useState(false);

    const formatMoney = (val) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(val || 0);
    };

    const totalEstimado = credito.total_estimado || 0;
    const pagado = credito.pagado || 0;
    const restante = totalEstimado - pagado;
    const porcentajeProgreso = totalEstimado > 0 ? Math.min((pagado / totalEstimado) * 100, 100) : 0;

    const esEstadoFinal = ['rechazado', 'aprobado', 'activo'].includes(credito.estado?.toLowerCase());

    const generarFilasAmortizacion = () => {
        const filas = [];
        const quincenasTotales = (credito.plazo_meses || 0) * 2;
        const pago1 = credito.pago_quincenal_ano1 || 0;
        const pago2 = credito.pago_quincenal_ano2 || pago1;

        for (let i = 1; i <= quincenasTotales; i++) {
            const esAno2 = i > 24; 
            const montoCuota = esAno2 ? pago2 : pago1;
            filas.push(
                <tr key={i} className={esAno2 ? 'row-fidelidad' : ''}>
                    <td>Q. {i}</td>
                    <td>{formatMoney(montoCuota)}</td>
                </tr>
            );
        }
        return filas;
    };

    const handleSignDocument = async (nombreDocumento) => {
        setUploading(nombreDocumento);
        try {
            const creditoRef = doc(db, "creditos", credito.id);
            const creditoSnap = await getDoc(creditoRef);

            if (creditoSnap.exists()) {
                const nuevoExpediente = creditoSnap.data().expediente.map(docExp => 
                    docExp.nombre === nombreDocumento ? { 
                        ...docExp, 
                        estatus: 'firmado', 
                        fecha_firma: new Date().toISOString() 
                    } : docExp
                );
                await updateDoc(creditoRef, { expediente: nuevoExpediente, lastUpdate: new Date() });
                
                // También actualizar en el expediente del usuario
                const userRef = doc(db, "usuarios", credito.usuario_id);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const userExp = userSnap.data().expediente.map(docExp => 
                        docExp.nombre === nombreDocumento ? { 
                            ...docExp, 
                            estatus: 'firmado', 
                            fecha_firma: new Date().toISOString() 
                        } : docExp
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
                    docExp.nombre === nombreDocumento ? { 
                        ...docExp, 
                        url: null, 
                        estatus: 'pendiente', 
                        fecha_remocion: new Date().toISOString() 
                    } : docExp
                );
                await updateDoc(creditoRef, { expediente: nuevoExpediente, lastUpdate: new Date() });
                
                const userRef = doc(db, "usuarios", credito.usuario_id);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const userExp = userSnap.data().expediente.map(docExp => 
                        docExp.nombre === nombreDocumento ? { 
                            ...docExp, 
                            url: null, 
                            estatus: 'pendiente'
                        } : docExp
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
                    docExp.nombre === nombreDocumento ? { ...docExp, url: downloadURL, estatus: 'revision', fecha_subida: new Date().toISOString() } : docExp
                );
                await updateDoc(creditoRef, { expediente: nuevoExpediente, lastUpdate: new Date() });
                
                // OCR y Auto-KYC: Revisa si todos los docs de la Fase 1 fueron subidos
                // O si estamos reemplazando un documento RECHAZADO
                const todosSubidos = nuevoExpediente.every(d => d.url && d.url.trim() !== '');
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

    const runOCR = async (docsExpediente) => {
        setShowGeminiModal(true);
        setUploading('OCR_PROGRESS');
        try {
            const urls = docsExpediente.map(d => d.url).filter(Boolean);
            const analizarFunc = httpsCallable(functions, 'analizarDocumentosGenerales');
            const res = await analizarFunc({ 
                creditoId: credito.id, 
                usuarioId: credito.usuario_id,
                documentUrls: urls 
            });
            
            const payload = res.data || {};
            
            // Avanzamos a la Fase 2 (KYC) automáticamente después del análisis IA (solo si estamos en fase 1)
            try {
                if (credito.fase === 1 || !credito.fase) {
                    const creditoRef = doc(db, "creditos", credito.id);
                    await updateDoc(creditoRef, { 
                        fase: 2,
                        lastUpdate: new Date()
                    });
                }
            } catch (phaseError) {
                console.error("Error updating phase after OCR:", phaseError);
            }

            if (payload.requiresManualReview) {
                 setStatus({ open: true, type: 'warning', message: payload.message || 'Se requiere revisión manual de un revisor. Dirígete a la pestaña de KYC para comprobar tus datos actuales.' });
            } else {
                 setStatus({ open: true, type: 'success', message: '¡Análisis completo IA! Ya puedes verificar tu información en el Paso 2.' });
            }
            
            if (onUploadSuccess) await onUploadSuccess();
        } catch (ocrError) {
            console.error('Error con OCR Gemini:', ocrError);
            setStatus({ open: true, type: 'error', message: 'Hubo un error analizando los documentos. Por favor procede manualmente a KYC o intenta re-analizar más tarde.' });
            if (onUploadSuccess) await onUploadSuccess();
        } finally {
            setUploading(null);
            setShowGeminiModal(false);
        }
    };

    const todosDocUploadeds = expediente.length > 0 && expediente.every(d => !!d.url);
    const requiresRetryOption = todosDocUploadeds && !credito.kycMaster && (credito.fase === 1 || !credito.fase);

    return (
        <div className={`user-credit-card animate-pop ${credito.estado?.toLowerCase()}`}>
            <div className="credit-header">
                <div className="amount-group">
                    <span className="label">Crédito {credito.tipo_credito}</span>
                    <p className="amount">{formatMoney(credito.monto_solicitado)}</p>
                </div>
                <div className={`badge-status ${(credito.estado || 'PENDIENTE').toLowerCase()}`}>
                    {(credito.estado || 'PENDIENTE').toUpperCase()}
                </div>
            </div>

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
                            <thead><tr><th>Quincena</th><th>Monto</th></tr></thead>
                            <tbody>{generarFilasAmortizacion()}</tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="expediente-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 className="section-subtitle" style={{ margin: 0 }}>DOCUMENTACIÓN</h4>
                    {requiresRetryOption && (
                        <button 
                            onClick={() => runOCR(expediente)}
                            disabled={uploading === 'OCR_PROGRESS'}
                            style={{ padding: '6px 12px', fontSize: '0.85rem', fontWeight: 'bold', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            title="Reintentar el análisis automático con IA"
                        >
                            {uploading === 'OCR_PROGRESS' ? <FiLoader className="spinner" /> : <FiTrendingUp />} Reintentar IA
                        </button>
                    )}
                </div>
                <div className="docs-grid">
                    {expediente.map((doc, idx) => {
                        const est = (doc.estatus || 'pendiente').toLowerCase();
                        return (
                            <div key={idx} className={`doc-box ${est}`}>
                                <span className="doc-name">{doc.nombre}</span>
                                <div className="doc-action">
                                    {est === 'aprobado' || est === 'validado' || est === 'firmado' ? (
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            {doc.url && <a href={doc.url} target="_blank" rel="noreferrer" className="action-icon-btn view"><FiEye /></a>}
                                            <FiCheckCircle className="st-icon text-success" />
                                        </div>
                                    ) :
                                     est === 'revision' || est === 'rechazado' || (doc.url && est === 'pendiente') ? (
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                                            {doc.url && (
                                                <>
                                                    <a href={doc.url} target="_blank" rel="noreferrer" className="action-icon-btn view" title="Ver documento"><FiEye /></a>
                                                    <button onClick={() => handleRemoveDocument(doc.nombre)} className="action-icon-btn delete" title="Eliminar"><FiTrash2 /></button>
                                                </>
                                            )}
                                            <label className={`upload-btn mini ${uploading === doc.nombre ? 'loading' : ''} ${est === 'rechazado' ? 'retry' : ''}`} title="Reemplazar">
                                                {uploading === doc.nombre ? <FiLoader className="spinner" /> : <FiUploadCloud />}
                                                <input type="file" hidden onChange={(e) => handleFileChange(e, doc.nombre)} disabled={!!uploading} accept=".pdf,.jpg,.jpeg,.png" />
                                            </label>
                                            {est === 'revision' && !doc.url && <FiClock className="st-icon text-warning pulse" />}
                                        </div>
                                     ) :
                                     est === 'pendiente_firma' ? (
                                         <button 
                                            className="btn-sign-doc" 
                                            onClick={() => handleSignDocument(doc.nombre)}
                                            disabled={!!uploading}
                                         >
                                             {uploading === doc.nombre ? <FiLoader className="spinner" /> : <FiPenTool />} 
                                             <span>Firmar</span>
                                         </button>
                                     ) : (
                                        doc.isAdmin ? (
                                            <span className="admin-only-tag"><FiLock /> Solo Lectura</span>
                                        ) : (
                                            <label className={`upload-btn ${uploading === doc.nombre ? 'loading' : ''} ${est === 'rechazado' ? 'retry' : ''}`}>
                                                {uploading === doc.nombre ? <FiLoader className="spinner" /> : <FiUploadCloud />}
                                                <input type="file" hidden onChange={(e) => handleFileChange(e, doc.nombre)} disabled={!!uploading} accept=".pdf,.jpg,.jpeg,.png" />
                                            </label>
                                        )
                                     )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <StatusModal isOpen={status.open} type={status.type} message={status.message} onClose={() => setStatus({ ...status, open: false })} />
            <GeminiProcessingModal isOpen={showGeminiModal} />
        </div>
    );
};