import React from 'react';
import HeroBackground from './HeroBackground'; 
import '../../../assets/styles/Home/HeroSection.css';

import bgHero from '../../../assets/images/2.jpg'; 

export const HeroSection = () => {
  return (
    <section className="hero-section">
      <HeroBackground backgroundImage={bgHero} />

      <div className="hero-content">
        <span className="hero-badge">¡CrediGo, El crédito que avanza contigo!</span>
        <h1>Descubre nuestras opciones de crédito pensadas para acompañarte.</h1>
      </div>
    </section>
  );
};