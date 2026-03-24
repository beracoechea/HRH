/* src/pages/Dashboard/components/InfoSection/InfoSection.jsx */
import React from 'react';
import '../../../assets/styles/Home/InfoSection.css';

export const InfoSection = ({ image1, image2 }) => {
  return (
    <section className="info-section">
      
      <div className="info-row fade-in-section">
        <div className="info-text">
          <h2 className="section-title">¿Qué es <span className="text-teal">CrediGo</span>?</h2>
          <p>
            Producto financiero exclusivo para colaboradores, que ofrece créditos personales 
            con tasas preferenciales mediante descuento vía nómina. 
          </p>
          <p>
             El financiamiento se otorga a través de una <b>SOFOM regulada</b> por la <b>CONDUSEF</b> y 
            la <b>CNBV</b>, con contratos registrados ante el <b>RECA</b>, lo que garantiza un <b>esquema seguro, transparente</b> y con 
             control operativo.
          </p>
        </div>
        <div className="info-image-wrapper">
          <img src={image1} alt="Explicación Credigo" className="img-fluid rounded shadow-hover" />
        </div>
      </div>

      <div className="info-row reverse fade-in-section delay-200">
        <div className="info-text">
          <h3 className="section-subtitle">Nuestros Productos</h3>
          <p>
           Actualmente contamos con un producto de financiamiento diseñado exclusivamente para colaboradores: 
           un prestamos personal con condiciones preferenciales, enfocado en su bienestar financiero.
          </p>
        </div>
        
        <div className="info-image-wrapper">
          <img src={image2} alt="Seguridad y Regulación" className="img-fluid rounded shadow-hover" />
        </div>
      </div>

    </section>
  );
};