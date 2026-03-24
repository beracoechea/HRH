/* src/pages/SimulaCredito.jsx */
import React from 'react';
import { InfoSimulador } from '../../components/formulario/InfoSimulador';
import { TimelineProceso } from '../../components/formulario/TimelineProceso';
import { FooterSection } from './components/FooterSection';

const SimulaCredito = () => {
    return (
        <main className="simula-page">
            <InfoSimulador />
            <TimelineProceso />
            <FooterSection />
            
        </main>
    );
};

export default SimulaCredito;