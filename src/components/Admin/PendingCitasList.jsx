import React, { useState } from 'react';
// AGREGAMOS FiCalendar A LA LISTA DE ABAJO
import { FiCheck, FiX, FiClock, FiInfo, FiLoader, FiFilter, FiCalendar } from 'react-icons/fi';
import { usePendingCitas } from '../../pages/hooks/usePendingCitas';
import '../../assets/styles/AdminCredits.css';

export const PendingCitasList = ({ citas, onActionComplete }) => {
    const [filtro, setFiltro] = useState('solicitada');
    const { handleAction, processingId } = usePendingCitas(onActionComplete);

    const citasFiltradas = filtro === 'todas' 
        ? citas 
        : citas.filter(c => (c.estatus === filtro || c.estado === filtro));

    return (
        <div className="appointments-admin-wrapper">
            <div className="filter-bar" style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <FiFilter color="#666" />
                {['solicitada', 'confirmada', 'rechazada', 'todas'].map(f => (
                    <button 
                        key={f}
                        className={`btn-filter ${filtro === f ? 'active' : ''}`}
                        onClick={() => setFiltro(f)}
                        style={{ textTransform: 'capitalize' }}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="appointments-table-container">
                <table className="appointments-table">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Motivo</th>
                            <th>Estado Actual</th>
                            <th>Fecha y Hora</th>
                            <th style={{ textAlign: 'center' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {citasFiltradas.map(cita => {
                            const currentStatus = cita.estatus || cita.estado || 'solicitada';
                            return (
                                <tr key={cita.id}>
                                    <td>
                                        <strong>{cita.nombre}</strong><br/>
                                        <small>{cita.email}</small>
                                    </td>
                                    <td>
                                        <span className="reason-badge">
                                            <FiInfo size={12} /> {cita.motivo || 'General'}
                                        </span>
                                    </td>
                                    <td>
                                        <select 
                                            value={currentStatus}
                                            className={`status-picker ${currentStatus}`}
                                            onChange={(e) => handleAction(cita.id, e.target.value)}
                                            disabled={processingId === cita.id}
                                        >
                                            <option value="solicitada">Solicitada</option>
                                            <option value="confirmada">Confirmada</option>
                                            <option value="rechazada">Rechazada</option>
                                        </select>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem' }}>
                                            <FiClock size={12} /> {cita.fecha}<br/>
                                            <strong>{cita.horario} hrs</strong>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div className="appointment-actions-group">
                                            <button 
                                                onClick={() => handleAction(cita.id, 'confirmada')}
                                                className="btn-action approve"
                                                disabled={processingId === cita.id || currentStatus === 'confirmada'}
                                            >
                                                {processingId === cita.id ? <FiLoader className="spinner" /> : <FiCheck />}
                                            </button>
                                            <button 
                                                onClick={() => handleAction(cita.id, 'rechazada')}
                                                className="btn-action reject"
                                                disabled={processingId === cita.id || currentStatus === 'rechazada'}
                                            >
                                                <FiX />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {citasFiltradas.length === 0 && (
                    <div className="empty-state" style={{ textAlign: 'center', padding: '40px' }}>
                        <FiCalendar size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
                        <p>No hay citas con estatus: <strong>{filtro}</strong></p>
                    </div>
                )}
            </div>
        </div>
    );
};