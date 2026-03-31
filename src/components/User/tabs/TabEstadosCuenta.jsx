import React from 'react';
import { FiFileText, FiDownload, FiClock } from 'react-icons/fi';

export const TabEstadosCuenta = ({ creditos = [] }) => {
    
    // Función para simular descarga o redirección a archivo en Firebase Storage
    const handleDownload = (creditoId) => {
        alert(`Generando estado de cuenta para el folio: ${creditoId}`);
        // Aquí iría la lógica de: window.open(url_del_pdf);
    };

    return (
        <section className="history-container animate-fade">
            <div className="section-header-inline">
                <div>
                    <h2>Estados de Cuenta</h2>
                    <p>Consulta el historial de tus pagos y descarga tus comprobantes anuales.</p>
                </div>
            </div>

            <div className="history-table-card">
                {creditos.length > 0 ? (
                    <div className="history-list">
                        {creditos.map(c => (
                            <div key={c.id} className="history-row-item">
                                <div className="hist-main-info">
                                    <div className="icon-doc-type">
                                        <FiFileText />
                                    </div>
                                    <div className="text-details">
                                        <strong>Crédito {c.tipo_credito || 'Personal'}</strong>
                                        <span>Folio: #{c.id?.slice(-8).toUpperCase()}</span>
                                    </div>
                                </div>

                                <div className="hist-status-date">
                                    <FiClock /> 
                                    <span>Iniciado: {c.fecha_inicio || 'En trámite'}</span>
                                </div>

                                <button 
                                    className="btn-download-action"
                                    onClick={() => handleDownload(c.id)}
                                >
                                    <FiDownload /> PDF
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state-simple">
                        <FiFileText size={40} />
                        <p>No se encontraron créditos registrados para generar estados de cuenta.</p>
                    </div>
                )}
            </div>
        </section>
    );
};