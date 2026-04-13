import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiUsers, FiLayers, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { useGroups } from '../../pages/hooks/useGroups';
import { db } from '../../firebase/config';
import { 
    collection, getDocs, query, addDoc, 
    deleteDoc, doc, serverTimestamp, orderBy 
} from 'firebase/firestore';
import '../../assets/styles/GroupManager.css';

export const GroupManager = ({ currentUser }) => {
    const { groups, loading, addGroup, refreshGroups } = useGroups();
    const [newGroupName, setNewGroupName] = useState('');
    const [status, setStatus] = useState({ show: false, message: '', type: '' });

    const handleAddGroup = async (e) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;

        const res = await addGroup(newGroupName, currentUser.uid);
        if (res.success) {
            setNewGroupName('');
            showMessage("Grupo creado exitosamente.", "success");
        } else {
            showMessage(res.message, "error");
        }
    };

    const handleDeleteGroup = async (groupId, groupName) => {
        if (!window.confirm(`¿Seguro que deseas eliminar el grupo "${groupName}"?`)) return;

        try {
            await deleteDoc(doc(db, 'grupos', groupId));
            showMessage("Grupo eliminado.", "success");
            refreshGroups();
        } catch (error) {
            console.error("Error deleting group:", error);
            showMessage("No se pudo eliminar el grupo.", "error");
        }
    };

    const showMessage = (msg, type) => {
        setStatus({ show: true, message: msg, type });
        setTimeout(() => setStatus({ show: false, message: '', type: '' }), 3000);
    };

    return (
        <div className="group-manager-card animate-fade">
            <header className="group-manager-header">
                <h3><FiLayers /> Gestión de Grupos / Socios</h3>
                <p>Administra los grupos asignables a usuarios para segmentar la información.</p>
            </header>

            <form className="add-group-form" onSubmit={handleAddGroup}>
                <div className="input-group">
                    <FiPlus className="input-icon" />
                    <input 
                        type="text" 
                        placeholder="Nombre del nuevo grupo (ej. Socio A, Recursos Humanos...)" 
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn-add-group">Crear Grupo</button>
            </form>

            {status.show && (
                <div className={`group-status-banner ${status.type}`}>
                    {status.type === 'success' ? <FiCheck /> : <FiAlertCircle />}
                    {status.message}
                </div>
            )}

            <div className="groups-list-table">
                {loading ? (
                    <div className="loading-state">Cargando grupos...</div>
                ) : groups.length === 0 ? (
                    <div className="empty-state">No hay grupos registrados todavía.</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Nombre del Grupo</th>
                                <th>ID del Sistema</th>
                                <th>Fecha Creación</th>
                                <th style={{ textAlign: 'center' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groups.map(g => (
                                <tr key={g.id}>
                                    <td><strong>{g.nombre}</strong></td>
                                    <td><code>{g.id_grupo}</code></td>
                                    <td>{g.createdAt?.toDate ? g.createdAt.toDate().toLocaleDateString() : 'N/A'}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button 
                                            className="btn-delete-group"
                                            onClick={() => handleDeleteGroup(g.id, g.nombre)}
                                            title="Eliminar Grupo"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

        </div>
    );
};
