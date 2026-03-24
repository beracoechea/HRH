import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import './ConfirmModal.css';

export const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, type = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="confirm-modal animate-pop">
        <button className="close-icon" onClick={onCancel}><FiX /></button>
        
        <div className={`icon-container ${type}`}>
          <FiAlertTriangle />
        </div>

        <h3>{title}</h3>
        <p>{message}</p>

        <div className="confirm-actions">
          <button className="btn-secondary" onClick={onCancel}>Cancelar</button>
          <button className={`btn-confirm ${type}`} onClick={onConfirm}>
            Confirmar Acción
          </button>
        </div>
      </div>
    </div>
  );
};