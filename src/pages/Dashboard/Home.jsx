/* src/pages/Dashboard/Home.jsx */
import React from 'react';
import '../../assets/styles/Home.css';

import { HeroSection } from './components/HeroSection';
import { InfoSection } from './components/InfoSection';
import { FaqSection } from './components/FaqSection';
import { BuroInfoSection } from './components/BuroInfoSection';
import { FooterSection } from './components/FooterSection';
import { CtaFinanciamiento } from './components/CalltoAction';

import aboutImg1 from '../../assets/images/1.jpg'; 

export const Home = () => {
  return (
    <div className="home-wrapper">
      <HeroSection />
      <CtaFinanciamiento />
      <InfoSection image1={aboutImg1}/>
      <FaqSection />
      <BuroInfoSection />
      <FooterSection />
    </div>
  );
};