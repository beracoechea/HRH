import React from 'react';
import { FiCalendar, FiClock, FiCheckCircle } from 'react-icons/fi';

export const UserCitaCard = ({ cita }) => {
  const fechaFormateada = new Date(cita.fecha).toLocaleDateString('es-MX', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="user-cita-card">
      <div className={`status-tag ${cita.estatus || 'pendiente'}`}>
        {cita.estatus === 'confirmada' ? <FiCheckCircle /> : <FiClock />}
        {cita.estatus || 'pendiente'}
      </div>
      <div className="cita-body">
        <h3>Asesoría Financiera</h3>
        <p><FiCalendar className="icon" /> {fechaFormateada}</p>
        <p><FiClock className="icon" /> {cita.horario} hrs</p>
      </div>
    </div>
  );
};