/* src/components/Admin/RoleAssignment.jsx */
import React, { useState } from 'react';
import { StatusModal } from '../Common/StatusModal';
import { useAuthActions } from '../../pages/hooks/useAuthActions';
import { FiShield, FiInfo } from 'react-icons/fi';
import '../../assets/styles/RoleAssignment.css';

export const RoleAssignment = ({ user, onClose, onUpdate }) => {
    // Estado local para el rol seleccionado en el dropdown
    const [newRole, setNewRole] = useState(user.rol || 'cliente');
    
    // Importamos las acciones del hook pasándole el callback onUpdate
    const { updateUserRole, loading, status, closeStatus } = useAuthActions(onUpdate);

    // Diccionario de descripciones para ayudar al administrador
    const roleDescriptions = {
        cliente: "Rol por defecto. Puede solicitar créditos y ver su propio estado.",
        marketing: "Acceso exclusivo al apartado de noticias y contenido promocional.",
        tesorero: "Encargado de registrar pagos y abonos de créditos aprobados.",
        aprobador: "Valida documentos, aprueba solicitudes y edita condiciones de crédito.",
        admin: "Acceso total a todas las funciones y gestión de roles del sistema."
    };

    const handleSave = async () => {
        // Ejecutamos la función asíncrona que ahora sí está exportada en el hook
        const success = await updateUserRole(user.id, user.email, newRole);
        
        if (success) {
            // Si la actualización fue exitosa, esperamos 1.5s para que el Admin
            // alcance a leer el StatusModal de éxito antes de cerrar el modal principal.
            setTimeout(() => { 
                onClose(); 
            }, 1500);
        }
    };

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="role-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="role-modal-header">
                        <FiShield size={30} color="#003366" />
                        <h3>Privilegios de Usuario</h3>
                        <p><strong>{user.nombre || 'Usuario'}</strong></p>
                        <span className="user-email-subtitle">{user.email}</span>
                    </div>
                    
                    <div className="role-selection">
                        <label>Seleccionar nuevo rol:</label>
                        <select 
                            value={newRole} 
                            onChange={(e) => setNewRole(e.target.value)} 
                            disabled={loading}
                            className="role-select"
                        >
                            <option value="cliente">Cliente (Default)</option>
                            <option value="marketing">Marketing</option>
                            <option value="tesorero">Tesorero</option>
                            <option value="aprobador">Aprobador</option>
                            <option value="admin">Administrador</option>
                        </select>
                        
                        <div className="role-help-box animate-fade">
                            <FiInfo size={18} />
                            <p>{roleDescriptions[newRole]}</p>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button 
                            className="cancel-btn" 
                            onClick={onClose} 
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleSave} 
                            className="save-btn" 
                            disabled={loading || newRole === user.rol}
                        >
                            {loading ? 'Guardando...' : 'Actualizar Permisos'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de estado (Éxito o Error) que viene del hook useAuthActions */}
            <StatusModal 
                isOpen={status.open} 
                type={status.type} 
                message={status.message} 
                onClose={closeStatus} 
            />
        </>
    );
};