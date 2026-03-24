/* src/components/Admin/UserCard.js */
import React from 'react';
import { FiEdit2, FiAlertCircle, FiUserCheck } from 'react-icons/fi';
import '../../assets/styles/UserCard.css';

// CAMBIO: Recibimos onEditRole para que coincida con UserManagement
export const UserCard = ({ user, onEditRole, isPriority }) => {
  
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
            <div className="role-container">
              <span className={`role-badge ${getRoleClass(user.rol)}`}>
                {user.rol || 'cliente'}
              </span>
            </div>
          </div>
        </div>

        <div className="user-actions">
          <button 
            className="edit-role-btn" 
            // CAMBIO: Aquí usamos onEditRole
            onClick={() => onEditRole(user)} 
            title="Asignar o Cambiar Rol"
          >
            <FiEdit2 />
            <span>Gestionar Rol</span>
          </button>
        </div>
      </div>
    </div>
  );
};