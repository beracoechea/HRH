import React, { useState, useMemo } from 'react';
import { 
    FiFilter,
     FiSearch 
} from 'react-icons/fi';

import '../../assets/styles/AdminCredits.css';
import { CreditRow } from './CreditRow';

export const PendingCreditosList = ({ creditos = [], onAction, onUpdateSuccess, fixedStatus = null }) => {
    const [filterStatus, setFilterStatus] = useState(fixedStatus || 'activo');
    const [searchTerm, setSearchTerm] = useState('');

    // Contadores dinámicos
    const counts = useMemo(() => ({
        activo: creditos.filter(c => c.estado === 'activo' || c.estado === 'atrasado').length,
        pendiente: creditos.filter(c => c.estado === 'pendiente').length,
        finalizado: creditos.filter(c => c.estado === 'finalizado').length,
        rechazado: creditos.filter(c => c.estado === 'rechazado').length,
    }), [creditos]);

    // Filtrado
    const filteredCreditos = useMemo(() => {
        return creditos.filter(cre => {
            let matchesStatus = true;
            if (fixedStatus === 'activo') {
                matchesStatus = (cre.estado === 'activo' || cre.estado === 'atrasado');
            } else if (fixedStatus) {
                matchesStatus = cre.estado === fixedStatus;
            } else {
                matchesStatus = filterStatus === 'activo' 
                    ? (cre.estado === 'activo' || cre.estado === 'atrasado')
                    : cre.estado === filterStatus;
            }
            
            const matchesSearch = 
                cre.usuario_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cre.usuario_email?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [creditos, filterStatus, searchTerm, fixedStatus]);

    return (
        <div className="credits-admin-wrapper animate-fade">
            <div className="admin-filters-bar">
                {!fixedStatus ? (
                    <div className="filter-group">
                        <FiFilter />
                        <div className="filter-buttons">
                            {['activo', 'pendiente', 'finalizado', 'rechazado'].map((status) => (
                                <button 
                                    key={status}
                                    className={`filter-tab-btn ${filterStatus === status ? 'active' : ''}`} 
                                    onClick={() => setFilterStatus(status)}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}s
                                    <span className="status-count-badge">{counts[status]}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="filter-group">
                        <span className="status-label-fixed">
                           Resultados: {filteredCreditos.length} coincidencias
                        </span>
                    </div>
                )}

                <div className="search-box-admin">
                    <FiSearch />
                    <input 
                        type="text" 
                        placeholder="Filtrar por nombre o email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="credits-table-container">
                <table className="credits-table">
                    <thead>
                        <tr>
                            <th>Usuario / Registro</th>
                            <th>Monto</th>
                            <th>Total c/ Int.</th>
                            <th>Esquema</th>
                            <th>Progreso (Monto Pagado)</th>
                            <th>Estatus</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCreditos.length > 0 ? (
                            filteredCreditos.map(cre => (
                                <CreditRow 
                                    key={cre.id} 
                                    cre={cre} 
                                    onAction={onAction} 
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="empty-table-msg">
                                    No hay créditos en esta categoría.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
};