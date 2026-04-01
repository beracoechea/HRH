import React, { useState } from 'react';
import { 
    FiClock, FiCheckCircle, FiUploadCloud, 
    FiLoader, FiTrendingUp, FiFileText, FiChevronDown, FiChevronUp, FiPenTool 
} from 'react-icons/fi';
import { db, storage, functions } from '../../firebase/config'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

import { StatusModal } from '../Common/StatusModal';
import '../../assets/styles/UserCreditoCard.css';

export const UserCreditoCard = ({ credito, expediente = [], onUploadSuccess }) => {
    const [uploading, setUploading] = useState(null);
    const [status, setStatus] = useState({ open: false, type: '', message: '' });
    const [showAmortization, setShowAmortization] = useState(false);

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

    const handleFileChange = async (e, nombreDocumento) => {
        const file = e.target.files[0];
        if (!file) return;
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
                const nuevoExpediente = creditoSnap.data().expediente.map(docExp => 
                    docExp.nombre === nombreDocumento ? { ...docExp, url: downloadURL, estatus: 'revision', fecha_subida: new Date().toISOString() } : docExp
                );
                await updateDoc(creditoRef, { expediente: nuevoExpediente, lastUpdate: new Date() });
                
                // OCR y Auto-KYC: Revisa si todos los docs de la Fase 1 fueron subidos
                const todosSubidos = nuevoExpediente.every(d => d.url && d.url.trim() !== '');
                if (todosSubidos && (credito.fase === 1 || !credito.fase)) {
                    setStatus({ open: true, type: 'info', message: 'Autocompletando tu Perfil (KYC). Leyendo documentos con IA, por favor espere unos segundos...' });
                    try {
                        const urls = nuevoExpediente.map(d => d.url).filter(Boolean);
                        const analizarFunc = httpsCallable(functions, 'analizarDocumentosGenerales');
                        const res = await analizarFunc({ creditoId: credito.id, documentUrls: urls });
                        
                        // NOTA: Si success === true, la nube (backend) ya avanza la fase a 2 y guarda kycData.
                        setStatus({ open: true, type: 'success', message: '¡Análisis completo! Verifica la información extraída.' });
                        if (onUploadSuccess) await onUploadSuccess();
                        return; // Evitar el toast nativo normal
                    } catch (ocrError) {
                        console.error('Error con OCR Gemini:', ocrError);
                        setStatus({ open: true, type: 'error', message: 'Hubo un error analizando los documentos. Por favor procede o vuelve a intentar.' });
                        if (onUploadSuccess) await onUploadSuccess();
                        return;
                    }
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
                <h4 className="section-subtitle">DOCUMENTACIÓN</h4>
                <div className="docs-grid">
                    {expediente.map((doc, idx) => {
                        const est = (doc.estatus || 'pendiente').toLowerCase();
                        return (
                            <div key={idx} className={`doc-box ${est}`}>
                                <span className="doc-name">{doc.nombre}</span>
                                <div className="doc-action">
                                    {est === 'aprobado' || est === 'validado' || est === 'firmado' ? <FiCheckCircle className="st-icon text-success" /> :
                                     est === 'revision' ? <FiClock className="st-icon text-warning pulse" /> :
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
                                     <label className={`upload-btn ${uploading === doc.nombre ? 'loading' : ''} ${est === 'rechazado' ? 'retry' : ''}`}>
                                         {uploading === doc.nombre ? <FiLoader className="spinner" /> : <FiUploadCloud />}
                                         <input type="file" hidden onChange={(e) => handleFileChange(e, doc.nombre)} disabled={!!uploading} accept=".pdf,.jpg,.jpeg,.png" />
                                     </label>
                                     )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <StatusModal isOpen={status.open} type={status.type} message={status.message} onClose={() => setStatus({ ...status, open: false })} />
        </div>
    );
};