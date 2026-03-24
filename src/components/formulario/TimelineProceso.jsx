/* src/components/Formulario/TimelineProceso.jsx */
import React from 'react';
import './TimelineProceso.css';

export const TimelineProceso = () => {
  const pasosProceso = [
    {
      id: "01",
      titulo: "Proyecta tu Crédito",
      descripcion: "Personaliza tu préstamo en segundos. Elige el monto ideal para visualizar un plan de pagos transparente y a tu medida."
    },
    {
      id: "02",
      titulo: "Trámite Simplificado",
      descripcion: "¡Sin filas! Entrega tu solicitud y documentos básicos directamente en Recursos Humanos. Nosotros nos encargamos del resto."
    },
    {
      id: "03",
      titulo: "Aprobación Express",
      descripcion: "Tu tiempo vale. En menos de 48 horas hábiles validamos tu información y recibes tu contrato listo para firmar."
    },
    {
      id: "04",
      titulo: "Liquidez Inmediata",
      descripcion: "¡Meta cumplida! Dispersamos los fondos directamente a tu cuenta de nómina para que dispongas de tu dinero hoy mismo."
    }
  ];

  return (
    <section className="proceso-premium">
      <div className="proceso-container">
        
        <header className="proceso-header">
          <span className="proceso-tag">El proceso con <strong>CrediGo </strong> es Simple • Rápido • Seguro</span>
          <h1>Tu crédito en <span>4 pasos</span></h1>
          <p>
            Obtén liquidez inmediata sin filas y sin complicaciones bancarias.
            <strong> Diseñamos un camino directo hacia tus metas.</strong>
          </p>
        </header>

        <div className="proceso-layout">
          {pasosProceso.map((paso, index) => (
            <div 
              key={paso.id} 
              className={`proceso-card-wrapper step-card-${index + 1}`}
            >
              <div className="proceso-card">
                <div className="card-number-bg">{paso.id}</div>
                <div className="card-content">
                  <span className="step-label">PASO {paso.id}</span>
                  <h3>{paso.titulo}</h3>
                  <p>{paso.descripcion}</p>
                </div>
                <div className="card-indicator"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};