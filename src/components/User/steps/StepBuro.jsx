import React from 'react';
import { FiSearch, FiFileText, FiDownload, FiClock, FiCheck } from 'react-icons/fi';
import '../../../assets/styles/User/StepBuro.css';

export const StepBuro = ({ user, credito }) => {
    // Buscamos si el admin ya subió el buró
    const buroDoc = credito?.expediente?.find(d => d.tipo_documento === 'buro');

    return (
        <div className="buro-step-container animate-fade">
            <div className="step-icon-bg pulse">
                <FiSearch />
            </div>
            <h2>Fase 2: Evaluación de Historial</h2>
            <p className="step-description">
                Nuestro equipo administrativo está consultando tu reporte de buró de crédito 
                para validar tu historial y ofrecerte las mejores condiciones.
            </p>

            <div className="buro-status-card">
                {!buroDoc ? (
                    <div className="status-waiting">
                        <div className="waiting-spinner">
                            <FiClock className="spin" />
                        </div>
                        <h3>En Revisión Administrativa</h3>
                        <p>Tan pronto como el administrador valide tu historial, podrás continuar al siguiente paso.</p>
                    </div>
                ) : (
                    <div className="status-completed">
                        <div className="check-icon-bg">
                            <FiCheck />
                        </div>
                        <h3>Buró Consultado Exitosamente</h3>
                        <p>Tu historial ha sido validado. Puedes revisar el documento adjunto a continuación.</p>
                        
                        <a href={buroDoc.url} target="_blank" rel="noreferrer" className="btn-view-buro">
                            <FiFileText /> Ver Reporte de Buró
                        </a>
                    </div>
                )}
            </div>

            <div className="info-note">
                <FiSearch />
                <p>Este proceso es automático y realizado por nuestro equipo de analistas de riesgo.</p>
            </div>
        </div>
    );
};
