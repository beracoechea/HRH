import React, { useState } from 'react';
import { FiX, FiLayers, FiPlus, FiSearch, FiCheck, FiMinusCircle } from 'react-icons/fi';
import { useGroups } from '../../pages/hooks/useGroups';
import '../../assets/styles/GroupAssignmentModal.css';

export const GroupAssignmentModal = ({ isOpen, currentGroup, onSelect, onClose, adminId }) => {
    const { groups, loading, addGroup } = useGroups();
    const [searchTerm, setSearchTerm] = useState('');
    const [newGroupName, setNewGroupName] = useState('');
    const [creating, setCreating] = useState(false);

    if (!isOpen) return null;

    const filteredGroups = groups.filter(g => 
        g.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) return;
        setCreating(true);
        const res = await addGroup(newGroupName, adminId);
        if (res.success) {
            onSelect(res.name);
            setNewGroupName('');
            onClose();
        } else {
            alert(res.message);
        }
        setCreating(false);
    };

    return (
        <div className="group-assign-overlay" onClick={onClose}>
            <div className="group-assign-modal" onClick={e => e.stopPropagation()}>
                <header className="group-assign-header">
                    <h3><FiLayers /> Seleccionar Grupo / Socio</h3>
                    <button className="btn-close-assign" onClick={onClose}><FiX /></button>
                </header>

                <div className="group-assign-body">
                    <div className="search-groups-box">
                        <FiSearch />
                        <input 
                            type="text" 
                            placeholder="Buscar grupo existente..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="groups-grid-selection">
                        {loading ? (
                            <div className="loading-state">Cargando grupos...</div>
                        ) : filteredGroups.length === 0 ? (
                            <div className="empty-state">No se encontraron grupos.</div>
                        ) : (
                            filteredGroups.map(g => (
                                <button 
                                    key={g.id} 
                                    className={`group-option-btn ${currentGroup === g.nombre ? 'selected' : ''}`}
                                    onClick={() => { onSelect(g.nombre); onClose(); }}
                                >
                                    <div className="name-wrap">
                                        <FiLayers />
                                        <span>{g.nombre}</span>
                                    </div>
                                    {currentGroup === g.nombre && <FiCheck />}
                                </button>
                            ))
                        )}
                    </div>

                    <button 
                        className="btn-no-group"
                        onClick={() => { onSelect(null); onClose(); }}
                    >
                        <FiMinusCircle /> Sin Grupo / Quitar Asignación
                    </button>
                </div>

                <div className="group-assign-footer">
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>
                        Crear Nuevo Grupo
                    </label>
                    <div className="create-group-inline">
                        <input 
                            type="text" 
                            placeholder="Nombre del nuevo socio..." 
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                        />
                        <button 
                            className="btn-create-small" 
                            onClick={handleCreateGroup}
                            disabled={creating || !newGroupName.trim()}
                        >
                            {creating ? '...' : <><FiPlus /> Crear y Asignar</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
