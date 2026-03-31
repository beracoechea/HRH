import React from 'react';
import { FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';
import '../../assets/styles/User/UserCitaCard.css';

export const UserCitaCard = ({ cita }) => {
    // Formateo de fecha para que sea legible
    const fechaLegible = cita.fecha ? new Date(cita.fecha + "T00:00:00").toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }) : 'Fecha no definida';

    const getEstatusInfo = (estatus) => {
        const s = estatus?.toLowerCase();
        if (s === 'confirmada' || s === 'aceptada') {
            return { class: 'confirmada', icon: <FiCheckCircle />, text: 'Confirmada' };
        }
        if (s === 'rechazada' || s === 'cancelada') {
            return { class: 'rechazada', icon: <FiXCircle />, text: 'Rechazada' };
        }
        return { class: 'solicitada', icon: <FiClock />, text: 'Solicitada' };
    };

    const estatusInfo = getEstatusInfo(cita.estatus || cita.estado);

    return (
        <div className={`user-cita-card animate-pop ${estatusInfo.class}`}>
            <div className="cita-header">
                <span className={`status-badge ${estatusInfo.class}`}>
                    {estatusInfo.icon} {estatusInfo.text}
                </span>
                <span className="cita-id">#{cita.id?.slice(-5)}</span>
            </div>
            
            <div className="cita-content">
                <h3 className="cita-motivo">
                    <FiInfo className="icon-label" /> {cita.motivo?.toUpperCase() || 'Asesoría General'}
                </h3>
                
                <div className="cita-details">
                    <div className="detail-item">
                        <FiCalendar />
                        <span>{fechaLegible}</span>
                    </div>
                    <div className="detail-item">
                        <FiClock />
                        <span>{cita.horario} hrs</span>
                    </div>
                </div>
            </div>

            {cita.google_event_id && (
                <div className="cita-sync-tag">
                    <small>✓ Sincronizada con Google Calendar</small>
                </div>
            )}
        </div>
    );
};