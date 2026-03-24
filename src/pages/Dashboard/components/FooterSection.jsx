import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiPhone, FiMail, FiLock, FiExternalLink, FiShield } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { AppointmentModal } from '../../../components/Common/AppointmentModal'; 
import { useAuth } from '../../../context/AuthContext';
import { ENTIDAD_CONFIG } from '../../../utils/Propiedades';
import '../../../assets/styles/Home/FooterSection.css';

export const FooterSection = () => {
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
      {/* SECCIÓN CTA (Llamada a la acción) */}
      <section className="cta-section">
        <div className="cta-content">
            <h2>¿Necesitas financiamiento?</h2>
            <p>Conoce <strong>CrediGo</strong>, el préstamo diseñado para colaboradores.</p>
            
            <button className="btn-cta-big" onClick={handleOpenModal}>
              {user ? <><FiCalendar /> Agendar Cita</> : <><FiLock /> Inicia sesión</>}
            </button>

            <div className="cta-separator"><span>O contáctanos directamente</span></div>

            <a href={`https://wa.me/${ENTIDAD_CONFIG.CONTACTO_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="btn-whatsapp-cta">
                <FaWhatsapp className="wa-icon-cta" /> Iniciar Chat por WhatsApp
            </a>

            <div className="footer-contact-links">
                <a href={`tel:+${ENTIDAD_CONFIG.UNE_TELEFONO}`} className="footer-link-item"><FiPhone /> {ENTIDAD_CONFIG.CONTACTO_TEL_VUE}</a>
                <span className="divider">|</span>
                <a href={`mailto:${ENTIDAD_CONFIG.CONTACTO_CORREO}`} className="footer-link-item"><FiMail /> {ENTIDAD_CONFIG.CONTACTO_CORREO}</a>
            </div>
        </div>
      </section>

      {/* FOOTER PRINCIPAL */}
      <footer className="home-footer">
        <div className="footer-container">
          
          {/* LOGOS DE AUTORIDADES */}
          <div className="authority-logos">
            <img src={ENTIDAD_CONFIG.LOGOS.SIPRES} alt="SIPRES" className="auth-img" />
            <img src={ENTIDAD_CONFIG.LOGOS.CNBV} alt="CNBV" className="auth-img" />
            <div className="auth-divider"></div>
            <div className="auth-text-badge">
              <FiShield />
              <span>Entidad Registrada</span>
            </div>
          </div>

          <div className="footer-legal-grid">
            {/* UNE */}
            <div className="legal-box">
              <h4>Unidad Especializada (UNE)</h4>
              <p><b>{ENTIDAD_CONFIG.NOMBRE_RAZON_SOCIAL}</b></p>
              <p>Titular: {ENTIDAD_CONFIG.UNE_TITULAR}</p>
              <p>Domicilio: {ENTIDAD_CONFIG.DOMICILIO_FISCAL}</p>
              <p>Tel: {ENTIDAD_CONFIG.CONTACTO_TEL_VUE} | <a href={`mailto:${ENTIDAD_CONFIG.UNE_CORREO}`}>{ENTIDAD_CONFIG.UNE_CORREO}</a></p>
              <p>Horario: {ENTIDAD_CONFIG.UNE_HORARIO}</p>
            </div>

            {/* CONDUSEF */}
            <div className="legal-box">
              <h4>CONDUSEF</h4>
              <p>Atención: 55 5340 0999 y 800 999 8080</p>
              <p><a href={ENTIDAD_CONFIG.LINK_CONDUSEF} target="_blank" rel="noreferrer">www.condusef.gob.mx</a></p>
              <div className="buro-link-footer">
                <img src={ENTIDAD_CONFIG.LOGOS.BURO} alt="Buró" className="buro-logo-small" />
                <Link to="/transparencia">Buró de Entidades Financieras <FiExternalLink /></Link>
              </div>
            </div>
          </div>

          <hr className="footer-divider" />

          {/* LEYENDAS LEGALES */}
          <div className="footer-articles">
            <p>
              Para su constitución y operación, <b>{ENTIDAD_CONFIG.NOMBRE_RAZON_SOCIAL}</b> no requiere autorización de la SHCP y está sujeta a la supervisión de la CNBV únicamente para efectos del <b>Artículo 95 Bis</b> de la LGOAAC.
            </p>
            <p className="article-warning">
              Incumplir tus obligaciones te puede generar comisiones e intereses moratorios.
            </p>
            <p className="article-disclaimer">
              De acuerdo con el Art. 87-J de la LGOAAC, esta entidad no recibe depósitos del público, por lo que no cuenta con seguro de depósito del IPAB.
            </p>
          </div>

          <div className="footer-bottom">
            <div className="bottom-links">
              <Link to="/transparencia">Aviso de Privacidad</Link>
              <Link to="/transparencia">Términos y Condiciones</Link>
              <Link to="/transparencia">Contratos (RECA)</Link>
            </div>
            <p className="copyright">
              © {ENTIDAD_CONFIG.YEAR} {ENTIDAD_CONFIG.NOMBRE_RAZON_SOCIAL}.
            </p>
          </div>
        </div>
      </footer>

      {user && (
        <AppointmentModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
};