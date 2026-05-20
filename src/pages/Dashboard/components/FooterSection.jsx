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
          <div className="legal-box full-width">
            <h4>Atención al Usuario (UNE)</h4>
            <p className="legal-text-small">
              {ENTIDAD_CONFIG.LEYENDAS.UNE_5_9(
                ENTIDAD_CONFIG.DOMICILIO_FISCAL,
                ENTIDAD_CONFIG.UNE_CORREO,
                ENTIDAD_CONFIG.UNE_TELEFONO
              )}
            </p>
          </div>

          <div className="legal-box">
             <h4>CONDUSEF</h4>
             <p className="legal-text-small"><b>{ENTIDAD_CONFIG.LEYENDAS.CONDUSEF_TITLE}</b></p>
             <p className="legal-text-small">{ENTIDAD_CONFIG.LEYENDAS.CONDUSEF_CONTACT}</p>
             <div className="buro-link-footer" style={{marginTop: '10px'}}>
               <img src={ENTIDAD_CONFIG.LOGOS.CONDUSEF} alt="CONDUSEF" className="buro-logo-small" />
               <a href={ENTIDAD_CONFIG.LINK_CONDUSEF} target="_blank" rel="noreferrer">www.condusef.gob.mx</a>
             </div>
          </div>

          <div className="legal-box">
            <h4>Buró de Entidades Financieras</h4>
            <p className="legal-text-small">{ENTIDAD_CONFIG.LEYENDAS.BURO_5_4}</p>
            <div className="buro-link-footer" style={{marginTop: '10px'}}>
              <img src={ENTIDAD_CONFIG.LOGOS.BURO} alt="Buró" className="buro-logo-small" />
              <Link to="/transparencia">Consultar Desempeño <FiExternalLink /></Link>
            </div>
          </div>
        </div>

        <hr className="footer-divider" />

        <div className="footer-articles">
          <p className="legal-article-item"><b>LEYENDA SHCP:</b> {ENTIDAD_CONFIG.LEYENDAS.SHCP_5_1}</p>
          <p className="legal-article-item"><b>LEYENDA CNBV (Supervisión):</b> {ENTIDAD_CONFIG.LEYENDAS.CNBV_5_2}</p>
          <p className="legal-article-item"><b>LEYENDA CNBV (Vigilancia):</b> {ENTIDAD_CONFIG.LEYENDAS.CNBV_5_3}</p>
          <p className="article-warning">Incumplir tus obligaciones te puede generar comisiones e intereses moratorios.</p>
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