/* src/pages/Dashboard/Home.jsx */
import React from 'react';
import '../../assets/styles/Home.css';

import { HeroSection } from './components/HeroSection';
import { InfoSection } from './components/InfoSection';
import { FaqSection } from './components/FaqSection';
import { FooterSection } from './components/FooterSection';

import aboutImg1 from '../../assets/images/1.jpg'; 
import aboutImg2 from '../../assets/images/3.jpg';

export const Home = () => {
  return (
    <div className="home-wrapper">
      <HeroSection />
      <InfoSection image1={aboutImg1} image2={aboutImg2} />
      <FaqSection />
      <FooterSection />
    </div>
  );
};