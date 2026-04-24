/* src/components/Formulario/InfoSimulador.jsx */
import React from 'react';
import { FiArrowRight } from 'react-icons/fi';
import './InfoSimulador.css';
import { CalculadoraForm } from './CalculadoraForm';
import { ENTIDAD_CONFIG } from '../../utils/Propiedades';
import imgSimulador from '../../assets/images/9.jpg';


export const InfoSimulador = () => {
  return (
    <section className="info-simulador-section">
      <div className="info-simulador-container">
        
        <div className="simulador-text-column">
          {/* Imagen integrada arriba */}
          <div className="simulador-image-header">
            <img src={imgSimulador} alt="Simulador de Crédito CrediGo" />
          </div>

          <div className="simulador-badge">
            <h2>¡SIMULA TU CRÉDITO A LA MEDIDA!</h2>
          </div>
          
          <p className="simulador-description">
            Antes de tomar una decisión, queremos que tengas claridad total. 
            Utiliza nuestra calculadora para estimar tu préstamo ideal, visualizar tus pagos 
            y conocer cómo funciona nuestro esquema de flexibilidad inicial.
          </p>
          
          <div className="simulador-arrow">
            <FiArrowRight size={40} />
          </div>
          
          <p className="simulador-note">
            <strong>Nota:</strong> Los montos y plazos están sujetos a la capacidad de pago y validación de historial crediticio.
          </p>

          <div className="simulador-legal-glossary">
            <div className="legal-item">
              <strong>DEFINICION DE CAT:</strong>
              <p>{ENTIDAD_CONFIG.LEYENDAS.CAT_5_5}</p>
            </div>
            <div className="legal-item">
               <strong>IMPORTANTE:</strong>
               <p>{ENTIDAD_CONFIG.LEYENDAS.TASA_VARIABLE_5_7}</p>
               <p>{ENTIDAD_CONFIG.LEYENDAS.AVAL_5_8}</p>
            </div>
          </div>
        </div>

        <div className="simulador-input-column">
          <CalculadoraForm isHeroView={true} />
          <p className="input-subtext" style={{marginTop: '15px', textAlign: 'center'}}>
            Revisa tu correo, ahí recibirás tu oferta formal.
          </p>
        </div>


      </div>
    </section>
  );
};