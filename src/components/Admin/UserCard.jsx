import React from 'react';
import { FiAlertCircle, FiUserCheck, FiRefreshCw, FiLayers } from 'react-icons/fi';
import { useAuthActions } from '../../pages/hooks/useAuthActions';
import { StatusModal } from '../Common/StatusModal';
import '../../assets/styles/UserCard.css';

export const UserCard = ({ user, onUpdateRole, isPriority, onClick }) => {
  const { updateUserRole, loading, status, closeStatus } = useAuthActions(onUpdateRole);
  
  const getRoleClass = (rol) => {
    const roles = {
      admin: 'role-admin',
      analista: 'role-analista',
      rh: 'role-rh',
      aprobador: 'role-aprobador',
      tesorero: 'role-tesorero',
      marketing: 'role-marketing',
      cliente: 'role-cliente'
    };
    return roles[rol?.toLowerCase()] || 'role-cliente';
  };

  return (
    <div className={`user-card ${isPriority ? 'priority-card' : ''}`} onClick={onClick} style={{ cursor: 'pointer' }}>
      {isPriority && (
        <div className="priority-badge-floating">
          <FiAlertCircle /> <span>Revisión Pendiente</span>
        </div>
      )}

      <div className="user-card-main">
        <div className="user-info">
          <div className={`user-avatar ${isPriority ? 'pulse-avatar' : ''}`}>
            {user.email ? user.email.charAt(0).toUpperCase() : <FiUserCheck />}
          </div>

          <div className="user-text">
            <h3>{user.nombre || 'Sin nombre configurado'}</h3>
            <p className="user-email-sub">{user.email}</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                <span className={`role-badge ${getRoleClass(user.rol)}`}>
                    {user.rol || 'cliente'}
                </span>
                
                {user.grupo && (
                    <div className="group-indicator">
                        <FiLayers /> <span>{user.grupo}</span>
                    </div>
                )}
            </div>
          </div>
        </div>

        {onUpdateRole && (
            <div className="user-actions">
                {loading ? (
                    <FiRefreshCw className="spinner" style={{ color: '#159082' }} />
                ) : (
                    <button 
                        className="btn-edit-premium" 
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick(); // Abrir el modal para edición detallada
                        }}
                        title="Gestionar Rol y Grupo"
                    >
                        <FiRefreshCw /> Gestionar
                    </button>
                )}
            </div>
        )}
      </div>
      
      <StatusModal 
          isOpen={status.open} 
          type={status.type} 
          message={status.message} 
          onClose={closeStatus} 
      />
    </div>
  );
};