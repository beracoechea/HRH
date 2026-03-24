/* src/components/Soluciones/SolucionesCard.jsx */
import React from 'react';
import './SolucionesCard.css';
import huchaImage from '../../assets/images/VerdeBlanco.png';

export const SolucionesCard = () => {
  return (
    <div className="soluciones-container">
      <div className="soluciones-card-main">
        <div className="soluciones-text">
          <p>En <strong>CrediGO</strong>, entendemos que la <strong>tranquilidad financiera es fundamental</strong> para tu bienestar.
          Por eso hemos diseñado <strong>soluciones de credito accesibles, transparentes</strong> y pensadas para adaptarse a tu capacidad de pago, no al revés.
          Nuestra prioridad es <strong>ofrecerte liquidez inmediata con un proceso ágil y seguro,</strong> directamente vinculado a tu nómina para que no tengas que preocuparte por las fechas de pago</p>

        </div>
        <div className="soluciones-visual">
          <img src={huchaImage} alt="Bienestar Financiero" />
        </div>
      </div>
    </div>
  );
};