import React, { useState } from 'react';
import { FiCheck, FiX, FiClock, FiUser, FiLoader } from 'react-icons/fi';
import { usePendingCitas } from '../../pages/hooks/usePendingCitas';
import '../../assets/styles/AdminAppointments.css';
export const PendingCitasList = ({ citas, onActionComplete }) => {
    const [filtro, setFiltro] = useState('pendiente');
    const { handleAction, processingId } = usePendingCitas(onActionComplete);

    // Filtrado inteligente: acepta ambos nombres de campo
    const citasFiltradas = filtro === 'todas' 
        ? citas 
        : citas.filter(c => (c.estatus === filtro || c.estado === filtro));

    return (
        <div className="appointments-admin-wrapper">
            <div className="filter-bar" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                {['pendiente', 'confirmada', 'rechazada', 'todas'].map(f => (
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
                            <th>Estado</th>
                            <th>Fecha y Hora</th>
                            <th style={{ textAlign: 'center' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {citasFiltradas.map(cita => {
                            const currentStatus = cita.estatus || cita.estado || 'sin estado';
                            return (
                                <tr key={cita.id}>
                                    <td>
                                        <strong>{cita.nombre}</strong><br/>
                                        <small>{cita.email}</small>
                                    </td>
                                    <td>
                                        <span className={`badge-status ${currentStatus}`}>
                                            {currentStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem' }}>
                                            <FiClock size={12} /> {cita.fecha}<br/>
                                            <strong>{cita.horario} hrs</strong>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {currentStatus === 'pendiente' && (
                                            <div className="appointment-actions-group">
                                                <button 
                                                    onClick={() => handleAction(cita.id, 'confirmar')}
                                                    className="btn-appointment-approve"
                                                    disabled={processingId === cita.id}
                                                >
                                                    {processingId === cita.id ? <FiLoader className="spinner" /> : <FiCheck />}
                                                </button>
                                                <button 
                                                    onClick={() => handleAction(cita.id, 'rechazar')}
                                                    className="btn-appointment-reject"
                                                    disabled={processingId === cita.id}
                                                >
                                                    <FiX />
                                                </button>
                                            </div>
                                        )}
                                        {cita.google_event_id && <small style={{color: 'green'}}>✓ Sincronizado</small>}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {citasFiltradas.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        No hay citas con estatus: <strong>{filtro}</strong>
                    </div>
                )}
            </div>
        </div>
    );
};