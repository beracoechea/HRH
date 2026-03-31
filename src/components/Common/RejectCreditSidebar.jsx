import React from 'react';
import { FiX, FiAlertTriangle, FiArrowRight, FiInfo } from 'react-icons/fi';
import './RejectCreditSidebar.css';

export const RejectCreditSidebar = ({ isOpen, creditId, onConfirm, onCancel }) => {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onCancel} />
      
      <div className={`reject-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3><FiAlertTriangle color="#dc3545" /> Rechazar Solicitud</h3>
          <button className="btn-close-sidebar" onClick={onCancel}><FiX /></button>
        </div>

        <div className="sidebar-body">
          <div className="warning-box">
            <p><strong>Atención:</strong> Estás por rechazar el crédito:</p>
            <code className="credit-id-display">ID: {creditId}</code>
          </div>

          <div className="info-note">
            <FiInfo />
            <p>Al confirmar, el estatus cambiará a <b>"Rechazado"</b> y se enviará una notificación al correo del cliente.</p>
          </div>

          <p className="confirmation-text">¿Estás seguro de que deseas proceder con el rechazo?</p>
        </div>

        <div className="sidebar-footer">
          <button className="btn-cancel-sidebar" onClick={onCancel}>Cancelar</button>
          <button className="btn-confirm-reject" onClick={onConfirm}>
            Confirmar Rechazo <FiArrowRight />
          </button>
        </div>
      </div>
    </>
  );
};