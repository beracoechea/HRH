/* src/components/Soluciones/InfoCredito.jsx */
import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import './InfoCredito.css';
import handCoinsImg from '../../assets/images/6.jpg'; 

export const InfoCredito = () => {
  return (
    <section className="info-credito">
      <div className="info-container">
        
        <div className="info-header">
          <div className="info-header-text">
            <h2>Crédito de Nómina <span>CrediGO</span></h2>
            <p>
              Diseñado exclusivamente para colaboradores de empresas afiliadas. 
              Olvídate de las filas en el banco y los trámites interminables. 
              Te ofrecemos un financiamiento personal con descuento automático 
              <strong> vía nómina, brindándote seguridad y comodidad.</strong>
            </p>
          </div>
          <div className="info-header-image">
            <img src={handCoinsImg} alt="Crédito de Nómina" />
          </div>
        </div>

        {/* --- SECCIÓN DE COLUMNAS --- */}
        <div className="info-grid">
          
          {/* Columna Izquierda: Diferenciadores */}
          <div className="info-column">
            <div className="info-badge-title">¿Qué nos hace diferentes?</div>
            <p className="column-intro">
              A diferencia de un crédito tradicional, en CrediGO pensamos en tu flujo de efectivo. 
              Nuestro modelo financiero te ofrece flexibilidad inicial:
            </p>
            <ul className="info-list">
              <li>
                <FiCheckCircle className="check-icon" />
                <div>
                  <strong>Primer año ligero:</strong> Durante los primeros 12 meses, tus pagos se enfocan únicamente en los intereses, permitiéndote tener cuotas mensuales más bajas y cómodas.
                </div>
              </li>
              <li>
                <FiCheckCircle className="check-icon" />
                <div>
                  <strong>Beneficio por lealtad:</strong> A partir del segundo año, al comenzar a pagar el capital, te recompensamos con un descuento del 50% en la tasa de interés.
                </div>
              </li>
            </ul>
          </div>

          {/* Columna Derecha: Beneficios */}
          <div className="info-column">
            <div className="info-badge-title secondary">Tus beneficios:</div>
            <ul className="info-list no-intro">
              <li>
                <FiCheckCircle className="check-icon" />
                <div>
                  <strong>Respuesta rápida:</strong> Sabemos que la velocidad importa. Recibe tu aprobación y notificación en un plazo de 48 horas hábiles tras completar tu expediente.
                </div>
              </li>
              <li>
                <FiCheckCircle className="check-icon" />
                <div>
                  <strong>Sin sorpresas:</strong> 0% de comisión por apertura y sin penalizaciones por pagos anticipados. Tú tienes el control de tu deuda.
                </div>
              </li>
              <li>
                <FiCheckCircle className="check-icon" />
                <div>
                  <strong>Montos adaptables:</strong> Préstamos desde $2,000 hasta $50,000 pesos, con tasas competitivas ajustadas según el monto solicitado.
                </div>
              </li>
              <li>
                <FiCheckCircle className="check-icon" />
                <div>
                  <strong>Comodidad total:</strong> Los pagos se descuentan automáticamente de tu nómina, evitando olvidos e intereses moratorios.
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
};