/* src/pages/SolucionesFinancieras.jsx */
import React from 'react';
import { SolucionesCard } from '../../components/Soluciones/SolucionesCard';
import { InfoCredito } from '../../components/Soluciones/InfoCredito';
import { ComoFunciona } from '../../components/Soluciones/ComoFunciona';
import { FooterSection } from './components/FooterSection';

const SolucionesFinancieras = () => {
  return (
    <div className="page-wrapper">


      <SolucionesCard />
      <InfoCredito />
      <ComoFunciona />
      <FooterSection />
    </div>
  );
};

export default SolucionesFinancieras;