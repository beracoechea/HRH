import React from 'react';
import { 
  FiUserCheck, FiSearch, FiUploadCloud, FiActivity, 
  FiFileText, FiEdit3, FiShield, FiCheckCircle
} from 'react-icons/fi';
import '../../assets/styles/StepperSolicitud.css';

const FASES = [
  { id: 1, label: 'KYC', icon: <FiUserCheck /> },
  { id: 2, label: 'Buró', icon: <FiSearch /> },
  { id: 3, label: 'Docs', icon: <FiUploadCloud /> },
  { id: 4, label: 'Análisis', icon: <FiActivity /> },
  { id: 5, label: 'Oferta', icon: <FiFileText /> },
  { id: 6, label: 'Firma', icon: <FiEdit3 /> },
  { id: 7, label: 'Validación', icon: <FiShield /> },
  { id: 8, label: 'Fondos', icon: <FiCheckCircle /> }
];

export const StepperSolicitud = ({ faseActual = 1 }) => {
  return (
    <div className="stepper-main-container">
      <div className="stepper-track">
        {FASES.map((fase, index) => {
          const isCompleted = faseActual > fase.id;
          const isActive = faseActual === fase.id;

          return (
            <div 
              key={fase.id} 
              className={`step-wrapper ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
            >
              <div className="step-node">
                {/* Si ya pasó esta fase, mostramos Check, si no, su icono */}
                {isCompleted ? <FiCheckCircle className="check-icon" /> : fase.icon}
                
                {/* Badge con el número de paso */}
                <span className="step-number-badge">{fase.id}</span>
              </div>
              
              <div className="step-info">
                <span className="step-label">{fase.label}</span>
                {isActive && <span className="current-dot">●</span>}
              </div>

              {index < FASES.length - 1 && (
                <div className={`step-line ${faseActual > fase.id ? 'line-filled' : ''}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};