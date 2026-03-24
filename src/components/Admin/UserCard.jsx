import React from 'react';
import { FiAlertCircle, FiUserCheck, FiRefreshCw } from 'react-icons/fi';
import { useAuthActions } from '../../pages/hooks/useAuthActions';
import { StatusModal } from '../Common/StatusModal';
import '../../assets/styles/UserCard.css';

export const UserCard = ({ user, onUpdateRole, isPriority }) => {
  const { updateUserRole, loading, status, closeStatus } = useAuthActions(onUpdateRole);
  const getRoleClass = (rol) => {
    const roles = {
      admin: 'role-admin',
      aprobador: 'role-aprobador', // Nuevo
      tesorero: 'role-tesorero',   // Nuevo
      marketing: 'role-marketing', // Nuevo
      cliente: 'role-cliente'
    };
    return roles[rol?.toLowerCase()] || 'role-cliente';
  };

  return (
    <div className={`user-card ${isPriority ? 'priority-card' : ''}`}>
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
            <div className="role-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {onUpdateRole ? (
                  <select 
                      className={`role-badge ${getRoleClass(user.rol)}`} 
                      style={{ cursor: 'pointer', appearance: 'none', border: 'none', outline: 'none' }}
                      value={user.rol || 'cliente'} 
                      onChange={async (e) => {
                          const newRole = e.target.value;
                          if (newRole !== user.rol) {
                              await updateUserRole(user.id, user.email, newRole);
                          }
                      }}
                      disabled={loading}
                      title="Cambiar permisos del usuario"
                  >
                      <option value="cliente">Cliente</option>
                      <option value="marketing">Marketing</option>
                      <option value="tesorero">Tesorero</option>
                      <option value="aprobador">Aprobador</option>
                      <option value="admin">Administrador</option>
                  </select>
              ) : (
                  <span className={`role-badge ${getRoleClass(user.rol)}`}>
                    {user.rol || 'cliente'}
                  </span>
              )}
              {loading && <FiRefreshCw className="spinner" style={{ color: '#64748b', fontSize: '0.9rem' }} />}
            </div>
          </div>
        </div>
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