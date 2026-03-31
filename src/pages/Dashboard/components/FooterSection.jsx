import React from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink, FiShield } from 'react-icons/fi';
import { ENTIDAD_CONFIG } from '../../../utils/Propiedades';
import '../../../assets/styles/Home/FooterSection.css';

export const FooterSection = () => {
  return (
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
          <div className="legal-box">
            <h4>Unidad Especializada (UNE)</h4>
            <p><b>{ENTIDAD_CONFIG.NOMBRE_RAZON_SOCIAL}</b></p>
            <p>Titular: {ENTIDAD_CONFIG.UNE_TITULAR}</p>
            <p>Domicilio: {ENTIDAD_CONFIG.DOMICILIO_FISCAL}</p>
            <p>Tel: {ENTIDAD_CONFIG.UNE_TELEFONO} | <a href={`mailto:${ENTIDAD_CONFIG.UNE_CORREO}`}>{ENTIDAD_CONFIG.UNE_CORREO}</a></p>
          </div>

          <div className="legal-box">
             <h4>CONDUSEF</h4>
             <div className="buro-link-footer">
               <img src={ENTIDAD_CONFIG.LOGOS.CONDUSEF} alt="CONDUSEF" className="buro-logo-small" />
               <p>Atención: 55 5340 0999 y 800 999 8080</p>
             </div>
            <p><a href={ENTIDAD_CONFIG.LINK_CONDUSEF} target="_blank" rel="noreferrer">www.condusef.gob.mx</a></p>
            <div className="buro-link-footer">
              <img src={ENTIDAD_CONFIG.LOGOS.BURO} alt="Buró" className="buro-logo-small" />
              <Link to="/transparencia">Buró de Entidades Financieras <FiExternalLink /></Link>
            </div>
          </div>
        </div>

        <hr className="footer-divider" />

        <div className="footer-articles">
          <p>Para su constitución y operación... (texto legal) </p>
          <p className="article-warning">Incumplir tus obligaciones te puede generar comisiones e intereses moratorios.</p>
          <p className="article-disclaimer">De acuerdo con el Art. 87-J de la LGOAAC...</p>
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
  );
};