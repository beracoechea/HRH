import { CREDIT_STEPS } from '../../constants/creditSteps';
import './TimelineProceso.css';

export const TimelineProceso = () => {
  return (
    <section className="proceso-premium">
      <div className="proceso-container">
        
        <header className="proceso-header">
          <span className="proceso-tag">El proceso con <strong>CrediGo </strong> es Simple • Rápido • Seguro</span>
          <h1>Tu crédito en <span>8 pasos</span></h1>
          <p>
            Obtén liquidez inmediata sin filas y sin complicaciones bancarias.
            <strong> Diseñamos un camino directo hacia tus metas.</strong>
          </p>
        </header>

        <div className="proceso-layout">
          {CREDIT_STEPS.map((paso, index) => (
            <div 
              key={paso.id} 
              className={`proceso-card-wrapper step-card-${index + 1}`}
            >
              <div className="proceso-card">
                <div className="card-number-bg">{String(paso.id).padStart(2, '0')}</div>
                <div className="card-content">
                  <span className="step-label">PASO {String(paso.id).padStart(2, '0')}</span>
                  <h3>{paso.label}</h3>
                  <p>{paso.description}</p>
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