import React from 'react';
import '../../assets/styles/StatusPill.css';

/**
 * Componente universal para mostrar badges de estado
 * @param {string} status - El estado (pendiente, activo, rechazado, etc.)
 */
export const StatusPill = ({ status = 'pendiente' }) => {
    const normalized = status?.toLowerCase() || 'pendiente';
    
    return (
        <span className={`status-pill ${normalized}`}>
            {normalized.charAt(0).toUpperCase() + normalized.slice(1).replace('_', ' ')}
        </span>
    );
};
