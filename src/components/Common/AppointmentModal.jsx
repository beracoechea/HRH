/* src/components/Common/AppointmentModal.jsx */
import React from 'react';
import { FiX, FiCalendar, FiClock, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import { useAppointment } from '../../pages/hooks/useAppointment';
import { StatusModal } from './StatusModal';
import '../../assets/styles/AppointmentModal.css';

export const AppointmentModal = ({ isOpen, onClose }) => {
  const { 
    formData, loading, status, handleChange, 
    handleSubmit, setStatus, isAuthenticated 
  } = useAppointment(onClose);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
          <button className="close-modal" onClick={onClose}><FiX /></button>
          
          <div className="modal-header-icon">
             <FiCalendar />
          </div>
          <h3>Agendar mi Cita</h3>
          <p className="modal-subtitle">Organiza tu visita para una atención personalizada.</p>
          
          <form onSubmit={handleSubmit} className="appointment-form">
            <div className="input-group">
              <FiUser className="input-icon" />
              <input 
                type="text" name="nombre" placeholder="Nombre completo" 
                required onChange={handleChange} value={formData.nombre}
              />
            </div>

            <div className="input-group">
              <FiMail className="input-icon" />
              <input 
                type="email" name="email" placeholder="Correo electrónico" 
                required onChange={handleChange} value={formData.email}
                disabled={isAuthenticated} // Bloqueado si ya está logueado
                className={isAuthenticated ? 'input-disabled' : ''}
              />
            </div>

            <div className="input-group">
              <FiPhone className="input-icon" />
              <input 
                type="tel" name="telefono" placeholder="Teléfono a 10 dígitos" 
                required onChange={handleChange} value={formData.telefono}
                maxLength="10"
              />
            </div>
            
            <div className="form-group-row">
              <div className="input-field">
                <label><FiCalendar /> Fecha</label>
                <input 
                  type="date" name="fecha" required 
                  min={minDate} // Restricción visual de fecha
                  onChange={handleChange} value={formData.fecha}
                />
              </div>
              <div className="input-field">
                <label><FiClock /> Horario</label>
                <input 
                  type="time" name="horario" required 
                  onChange={handleChange} value={formData.horario}
                />
              </div>
            </div>
            
            <button type="submit" className="btn-submit-appointment" disabled={loading}>
              {loading ? "Procesando..." : "Confirmar mi Cita"}
            </button>
          </form>
        </div>
      </div>

      <StatusModal 
        isOpen={status.open} 
        type={status.type} 
        message={status.message} 
        onClose={() => setStatus({ ...status, open: false })}
      />
    </>
  );
};