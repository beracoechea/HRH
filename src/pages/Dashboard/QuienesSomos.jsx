/* src/pages/AboutUs/AboutUs.jsx */
import React, { memo } from 'react';
import '../../assets/styles/AboutUs/AboutUs.css';
import { FooterSection } from '../Dashboard/components/FooterSection';

import teamImg from '../../assets/images/4.jpg';
import aboutImg2 from '../../assets/images/5.jpg';

const InfoBlock = memo(({ title, text, type, image, reverse }) => (
  <div className={`about-row ${reverse ? 'reverse' : ''} fade-in-view`}>
    <div className="about-image">
      <img 
        src={image} 
        alt={title} 
        loading="lazy" 
        className="img-optimized" 
      />
    </div>
    <div className={`about-text ${type}`}>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  </div>
));

export const AboutUs = () => {
  return (
    <main className="about-page">
      <header className="about-compact-header">
        <div className="header-content">
          <h1>Conoce CrediGo</h1>
        </div>
      </header>

      <section className="about-main-content">
        <div className="about-container">
          <InfoBlock 
            title="Financiamiento claro, diseñado para ti"
            text="Somos una plataforma financiera dedicada a brindar soluciones de crédito accesibles. Nos enfocamos en la agilidad y la transparencia para que puedas alcanzar tus objetivos con la tranquilidad de un respaldo sólido."
            type="card-coral"
            image={teamImg}
          />

         <InfoBlock 
            text={
              <>
                <strong>Misión:</strong> Facilitar el acceso a servicios financieros mediante procesos simplificados y atención personalizada.
                <br /><br />
                <strong>Valores:</strong> Confianza, claridad y compromiso con el bienestar financiero de nuestros usuarios.
              </>
            }
            type="card-teal"
            image={aboutImg2}
            reverse={true}
          />
        </div>
      </section>

      <FooterSection />
    </main>
  );
};