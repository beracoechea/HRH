import React from 'react';
import { FiFileText, FiDownload, FiClock, FiCheckCircle } from 'react-icons/fi';
import { useAccountStatements } from '../../../pages/hooks/useAccountStatements';
import '../../../assets/styles/TabEstadosCuenta.css';

export const TabEstadosCuenta = ({ creditos = [] }) => {
    return (
        <section className="history-container animate-fade">
            <div className="section-header-inline">
                <div>
                    <h2>Estados de Cuenta</h2>
                    <p>Consulta y descarga tus estados de cuenta oficiales emitidos por Tesorería.</p>
                </div>
            </div>

            <div className="credits-statements-grid">
                {creditos.length > 0 ? (
                    creditos.map(credit => (
                        <CreditStatementGroup key={credit.id} credit={credit} />
                    ))
                ) : (
                    <div className="empty-state-simple">
                        <FiFileText size={40} />
                        <p>Aún no tienes créditos activos para generar estados de cuenta.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

const CreditStatementGroup = ({ credit }) => {
    const { statements, loading } = useAccountStatements(credit.id);

    return (
        <div className="credit-statement-card">
            <div className="card-header-credit">
                <div className="credit-badge">{credit.tipo_credito || 'Personal'}</div>
                <h3>Folio: {credit.id?.slice(-8).toUpperCase()}</h3>
                <span className="status-indicator"><FiCheckCircle /> Activo</span>
            </div>

            <div className="statements-list-user">
                {loading ? (
                    <div className="loading-mini">Cargando documentos...</div>
                ) : statements.length > 0 ? (
                    statements.map(st => (
                        <div key={st.id} className="user-statement-row">
                            <div className="st-info">
                                <FiFileText className="st-icon" />
                                <div className="st-details">
                                    <span className="st-name">{st.nombre}</span>
                                    <span className="st-date">
                                        Emitido: {new Date(st.createdAt?.toDate?.() || st.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <a 
                                href={st.url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="btn-download-st"
                                title="Descargar PDF"
                            >
                                <FiDownload /> PDF
                            </a>
                        </div>
                    ))
                ) : (
                    <div className="no-statements-msg">
                        <FiClock />
                        <p>No hay documentos anexados por Tesorería para este crédito aún.</p>
                    </div>
                )}
            </div>
        </div>
    );
};