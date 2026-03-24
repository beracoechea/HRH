/* src/components/Modals/ManageDocModal.jsx */
import React, { useState, useEffect, useMemo } from 'react';
import { 
    FiX, FiCheck, FiXCircle, FiFileText, FiSquare, 
    FiCheckSquare, FiEye, FiMessageSquare 
} from 'react-icons/fi';
import '../../assets/styles/ManageDocModal.css';

export const ManageDocModal = ({ isOpen, credit, onClose, onUpdateStatus }) => {
    const [selectedDocs, setSelectedDocs] = useState([]); // Guardaremos los doc.nombre aquí
    const [obs, setObs] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Documentos que tienen archivo (URL) y tienen un nombre válido
    const docsDisponibles = useMemo(() => {
        return credit?.expediente?.filter(d => !!d.url && !!d.nombre) || [];
    }, [credit]);

    useEffect(() => {
        if (isOpen) {
            setSelectedDocs([]);
            setObs('');
        }
    }, [credit?.id, isOpen]);

    if (!isOpen || !credit) return null;

    // Seleccionar o desmarcar todos los que tienen nombre y archivo
    const handleToggleAll = () => {
        if (selectedDocs.length === docsDisponibles.length) {
            setSelectedDocs([]); 
        } else {
            const todosLosNombres = docsDisponibles.map(d => d.nombre);
            setSelectedDocs(todosLosNombres);
        }
    };

    // Seleccionar uno por uno basado en el nombre
    const toggleSelectOne = (nombre, hasUrl) => {
        if (!hasUrl || !nombre) return; 
        
        setSelectedDocs(prev => 
            prev.includes(nombre) 
                ? prev.filter(item => item !== nombre) 
                : [...prev, nombre]
        );
    };

    const handleBatchAction = async (status) => {
        if (selectedDocs.length === 0) return alert("Selecciona al menos un documento.");
        if (status === 'rechazado' && !obs.trim()) {
            return alert("Debes escribir un motivo de rechazo.");
        }

        setIsSubmitting(true);
        // Enviamos el nombre y el estatus para cada uno
        const updates = selectedDocs.map(nombre => ({ nombre, status }));
        
        try {
            await onUpdateStatus(updates, obs);
            setSelectedDocs([]);
            setObs('');
        } catch (error) {
            alert("Error al actualizar.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content doc-manager animate-pop" onClick={e => e.stopPropagation()}>
                
                <header className="modal-header">
                    <div className="header-top">
                        <div className="title-group">
                            <h2>Gestión de Expediente</h2>
                            <span className="user-subtitle">Cliente: {credit.usuario_nombre}</span>
                        </div>
                        <button className="close-btn" onClick={onClose}><FiX /></button>
                    </div>
                    
                    <div className="header-actions-bar">
                        <div className="selection-controls">
                            <button 
                                className={`btn-select-all ${selectedDocs.length > 0 ? 'active' : ''}`} 
                                onClick={handleToggleAll}
                                disabled={docsDisponibles.length === 0}
                            >
                                {selectedDocs.length > 0 && selectedDocs.length === docsDisponibles.length 
                                    ? <FiCheckSquare className="icon-blue" /> 
                                    : <FiSquare />
                                }
                                {selectedDocs.length === docsDisponibles.length ? "Desmarcar Todo" : "Seleccionar Todo"}
                            </button>
                            
                            {selectedDocs.length > 0 && (
                                <span className="selection-badge">
                                    {selectedDocs.length} seleccionado(s)
                                </span>
                            )}
                        </div>
                    </div>
                </header>

                <div className="docs-review-scroll-area">
                    <div className="docs-review-list">
                        {credit.expediente?.map((doc, idx) => {
                            const hasUrl = !!doc.url;
                            // Si doc.nombre es igual para todos, se seleccionarán todos. 
                            // Asegúrate que doc.nombre sea único (ej. "Identificación", "Comprobante Domicilio")
                            const isSelected = selectedDocs.includes(doc.nombre);

                            return (
                                <div 
                                    key={idx} 
                                    className={`review-item ${isSelected ? 'selected' : ''} ${!hasUrl ? 'disabled' : ''}`}
                                    onClick={() => toggleSelectOne(doc.nombre, hasUrl)}
                                >
                                    <div className="item-check">
                                        {hasUrl ? (
                                            isSelected ? <FiCheckSquare className="icon-blue" /> : <FiSquare />
                                        ) : (
                                            <FiSquare style={{ opacity: 0.3 }} />
                                        )}
                                    </div>
                                    
                                    <div className="item-main">
                                        <div className="item-info">
                                            <FiFileText className={`file-icon ${hasUrl ? 'active' : ''}`} />
                                            <div className="text-stack">
                                                {/* Mostramos el nombre del documento */}
                                                <span className="file-name">{doc.nombre || "Documento sin nombre"}</span>
                                                <span className={`badge-status ${doc.estatus?.toLowerCase()}`}>
                                                    {doc.estatus || 'pendiente'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="item-actions">
                                            {hasUrl ? (
                                                <a 
                                                    href={doc.url} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="btn-view" 
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <FiEye /> Ver Documento
                                                </a>
                                            ) : (
                                                <span className="no-file-tag">Sin archivo</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <footer className="modal-footer-obs">
                    <div className="observation-container">
                        <label><FiMessageSquare /> Observaciones / Motivo de rechazo:</label>
                        <textarea 
                            value={obs} 
                            onChange={(e) => setObs(e.target.value)} 
                            placeholder="Escribe las correcciones necesarias..."
                        />
                    </div>
                    
                    <div className="footer-btns">
                        <button 
                            className="btn-batch-reject" 
                            onClick={() => handleBatchAction('rechazado')}
                            disabled={isSubmitting || selectedDocs.length === 0}
                        >
                            <FiXCircle /> Rechazar Seleccionados
                        </button>
                        <button 
                            className="btn-batch-approve" 
                            onClick={() => handleBatchAction('aprobado')}
                            disabled={isSubmitting || selectedDocs.length === 0}
                        >
                            <FiCheck /> Aprobar Seleccionados
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};