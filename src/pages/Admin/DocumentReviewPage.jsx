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

export const DocumentReviewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { updateMultipleDocs } = useDocumentTracking();
    
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
                setCredit({ id: docSnap.id, ...docSnap.data() });
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
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Monto Solicitado:</span>
                            <strong style={{ fontSize: '1.5rem', color: 'var(--highlight)' }}>{formatMoney(credit.monto_solicitado)}</strong>
                        </div>
                    </div>
                </header>

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
