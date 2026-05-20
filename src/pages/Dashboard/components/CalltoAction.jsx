import React, { useState } from 'react';
import { FiCalendar, FiPhone, FiMail, FiLock } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { AppointmentSidebar } from '../../../components/Common/AppointmentSidebar.jsx';
import { useAuth } from '../../../context/AuthContext';
import { ENTIDAD_CONFIG } from '../../../utils/Propiedades';

export const CtaFinanciamiento = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, openLogin } = useAuth();

  const handleOpenModal = (e) => {
    if (e) e.preventDefault();
    if (!user) {
      openLogin();
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <section className="cta-section">
        <div className="cta-content">
          <h2>¿Necesitas financiamiento?</h2>
          <p>Descubre <strong>CrediGo:</strong> El impulso financiero que estabas buscando.</p>
          
          <button className="btn-cta-big" onClick={handleOpenModal}>
            {user ? <><FiCalendar /> Agendar Cita</> : <><FiLock /> Inicia sesión</>}
          </button>

          <div className="cta-separator"><span>O contáctanos directamente</span></div>

          <a 
            href={`https://wa.me/${ENTIDAD_CONFIG.CONTACTO_WHATSAPP}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-whatsapp-cta"
          >
            <FaWhatsapp className="wa-icon-cta" /> Iniciar chat por WhatsApp
          </a>

          <div className="footer-contact-links">
            {/* Teléfono */}
            <a href={`tel:+${ENTIDAD_CONFIG.CONTACTO_WHATSAPP}`} className="footer-link-item">
              <FiPhone /> {ENTIDAD_CONFIG.CONTACTO_TEL_VUE}
            </a>

            {/* Contenedor de correos */}
            <div className="emails-group">
              <a href={`mailto:${ENTIDAD_CONFIG.CONTACTO_CORREO}`} className="footer-link-item">
                <FiMail /> {ENTIDAD_CONFIG.CONTACTO_CORREO}
              </a>
              <a href={`mailto:${ENTIDAD_CONFIG.CONTACTO_CORREO2}`} className="footer-link-item">
                <FiMail /> {ENTIDAD_CONFIG.CONTACTO_CORREO2}
              </a>
            </div>
          </div>
      
        </div>
      </section>

      {user && (
        <AppointmentSidebar 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
};