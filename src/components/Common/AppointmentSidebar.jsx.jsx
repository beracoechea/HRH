import React from 'react';
import { FiX, FiCalendar, FiSend, FiCheckCircle, FiAlertCircle, FiClock } from 'react-icons/fi';
import { useAppointment } from '../../pages/hooks/useAppointment';
import './AppointmentSidebar.css';

export const AppointmentSidebar = ({ isOpen, onClose }) => {
  const { 
    formData, loading, status, minDate, 
    handleChange, handleSubmit, isAuthenticated 
  } = useAppointment(onClose);

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      
      <div className={`appointment-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3><FiCalendar /> Agendar Cita</h3>
          <button className="btn-close-sidebar" onClick={onClose}><FiX /></button>
        </div>

        <div className="sidebar-body">
          {status && (
            <div className={`status-msg ${status.type}`}>
              {status.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
              {status.message}
            </div>
          )}

          <p className="sidebar-intro">
            Hola <strong>{formData.nombre || 'Colaborador'}</strong>, selecciona el día y la hora exacta para tu asesoría.
          </p>

          <form className="sidebar-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Motivo</label>
              <select name="motivo" value={formData.motivo} onChange={handleChange} required>
                <option value="" disabled>Selecciona una opción</option>
                <option value="credigo">Crédito CrediGo</option>
                <option value="nomina">Adelanto de Nómina</option>
                <option value="dudas">Dudas Generales</option>
              </select>
            </div>

            <div className="form-group">
              <label>Fecha sugerida</label>
              <input 
                type="date" 
                name="fecha"
                min={minDate}
                value={formData.fecha}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label><FiClock /> Hora de la cita</label>
              <input 
                type="time" 
                name="horario"
                value={formData.horario}
                onChange={handleChange}
                required
                className="time-picker-input"
              />
              <small className="help-text">Horario de atención: 08:00 - 18:00</small>
            </div>

            <button 
              type="submit" 
              className="btn-submit-sidebar" 
              disabled={loading || !isAuthenticated || !formData.horario || !formData.fecha}
            >
              {loading ? 'Enviando...' : (
                isAuthenticated ? <><FiSend /> Agendar Cita ahora</> : 'Inicia sesión para continuar'
              )}
            </button>
          </form>
        </div>

        <div className="sidebar-footer">
          <small>Sujeto a confirmación por parte del equipo HRH.</small>
        </div>
      </div>
    </>
  );
};