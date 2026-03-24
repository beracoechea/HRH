import React from 'react';

const HeroBackground = ({ backgroundImage }) => {
  return (
    <div className="hero-carousel">
      <div className="hero-bg-wrapper">
        <img 
          src={backgroundImage} 
          alt="Hero Background" 
          className="hero-bg-img" 
        />
        <div className="hero-overlay"></div>
      </div>
    </div>
  );
};

export default HeroBackground;