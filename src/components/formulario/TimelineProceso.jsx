/* src/components/Formulario/TimelineProceso.jsx */
import React from 'react';
import './TimelineProceso.css';

export const TimelineProceso = () => {
  const pasosProceso = [
    {
      id: "01",
      titulo: "Simula y Personaliza",
      descripcion: "Define el monto y el plazo ideal para tu presupuesto. Visualiza tu cuota proyectada al instante, sin compromisos."
    },
    {
      id: "02",
      titulo: "Inicia la Solicitud",
      descripcion: "Completa un breve formulario y autoriza la consulta de historial crediticio para ofrecerte la mejor opción disponible."
    },
    {
      id: "03",
      titulo: "Carga tu documentación.",
      descripcion: "Sube tus documentos de forma digital y 100% segura."
    },
    {
      id: "04",
      titulo: "Revisa tu plan de pagos",
      descripcion: " Valida tu tabla de amortización. Queremos que tengas claridad total sobre tus fechas y montos antes de continuar."
    },
    {
      id: "05",
      titulo: "Firma con confianza",
      descripcion: "Formaliza tu contrato mediante firma electrónica o física, según lo que te resulte más cómodo. "
    },
    {
      id: "06",
      titulo: "¡Recibe tu dinero!",
      descripcion: "Tras la aprobación y firma, transferimos los fondos directo a tu cuenta bancaria. ¡El impulso que necesitas, listo para usarse!"
    }
  ];

  return (
    <section className="proceso-premium">
      <div className="proceso-container">
        
        <header className="proceso-header">
          <span className="proceso-tag">El proceso con <strong>CrediGo </strong> es Simple • Rápido • Seguro</span>
          <h1>Tu crédito en <span>6 pasos</span></h1>
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