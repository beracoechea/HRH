import React, { useEffect } from 'react';
import ReactDOM from 'react-dom'; // Necesitamos este import
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import './StatusModal.css';

export const StatusModal = ({ isOpen, onClose, type = 'info', message }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const icons = {
    success: <FiCheckCircle color="#10b981" />,
    error: <FiAlertCircle color="#ef4444" />,
    warning: <FiInfo color="#f59e0b" />,
    info: <FiInfo color="#3b82f6" />
  };

  return ReactDOM.createPortal(
    <div className="status-modal-overlay" onClick={onClose}>
      <div className={`status-modal-content ${type}`} onClick={e => e.stopPropagation()}>
        <div className="status-icon">{icons[type]}</div>
        <div className="status-text-container">
          <h3>{type === 'error' ? 'Aviso' : 'Mensaje'}</h3>
          <p>{message}</p>
        </div>
        <button className="status-confirm-btn" onClick={onClose}>Cerrar</button>
      </div>
    </div>,
    document.body 
  );
};