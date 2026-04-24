import React from 'react';
import { FiExternalLink, FiInfo } from 'react-icons/fi';
import { ENTIDAD_CONFIG } from '../../../utils/Propiedades';
import '../../../assets/styles/Home/BuroInfoSection.css';

export const BuroInfoSection = () => {
    return (
        <section className="buro-info-section animate-fade">
            <div className="buro-info-container">
                <div className="buro-logo-side">
                    <img src={ENTIDAD_CONFIG.LOGOS.BURO} alt="Buró de Entidades Financieras" className="buro-main-logo" />
                </div>
                <div className="buro-content-side">
                    <div className="buro-title-badge">
                        <FiInfo /> Transparencia y Desempeño
                    </div>
                    <h3>Buró de Entidades Financieras</h3>
                    <p className="buro-main-text">
                        {ENTIDAD_CONFIG.LEYENDAS.BURO_5_4}
                    </p>
                    <div className="buro-action-links">
                        <a 
                            href={ENTIDAD_CONFIG.LINK_BURO} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="btn-buro-external"
                        >
                            Consultar en buro.gob.mx <FiExternalLink />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};
