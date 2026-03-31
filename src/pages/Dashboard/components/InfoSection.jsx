/* src/pages/Dashboard/components/InfoSection/InfoSection.jsx */
import React from 'react';
import '../../../assets/styles/Home/InfoSection.css';

export const InfoSection = ({ image1 }) => {
  return (
    <section className="info-section">
      
      <div className="info-row fade-in-section">
        <div className="info-text">
          <h2 className="section-title">¿Por qué elegirnos? </h2>
          <p>
           <span className="text-teal"> Rapidez:</span> Respuesta en menos de 72 horas.<br/>
           <span className="text-teal"> Transparencia:</span> Sin comisiones ocultas y procesos claros.<br/>
           <span className="text-teal"> Seguridad:</span> Tu información protegida bajo estándares bancarios.

          </p>
        </div>
        <div className="info-image-wrapper">
          <img src={image1} alt="Explicación Credigo" className="img-fluid rounded shadow-hover" />
        </div>
      </div>

    </section>
  );
};