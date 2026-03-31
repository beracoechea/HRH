import React from 'react';
import HeroBackground from './HeroBackground'; 
import '../../../assets/styles/Home/HeroSection.css';

import bgHero from '../../../assets/images/2.jpg'; 

export const HeroSection = () => {
  return (
    <section className="hero-section">
      <HeroBackground backgroundImage={bgHero} />

      <div className="hero-content">
        <span className="hero-badge">Soluciones financieras a tu medida</span>
        <h1>Obten el respaldo que necesitas de forma rápida, segura y transparente.</h1>
      </div>
    </section>
  );
};