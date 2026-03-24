/* src/components/Soluciones/ComoFunciona.jsx */
import React from 'react';
import './ComoFunciona.css';

export const ComoFunciona = () => {
  const pasos = [
    {
      id: 1,
      titulo: "Solicita",
      descripcion: "Define el monto que necesitas y entréganos tu solicitud junto con la documentación básica."
    },
    {
      id: 2,
      titulo: "Análisis ágil",
      descripcion: "Nuestra Mesa de Control valida tu información y capacidad de pago rápidamente."
    },
    {
      id: 3,
      titulo: "Aprobación y firma",
      descripcion: "Si tu crédito es aprobado, recibirás la notificación y el contrato para firma al día hábil siguiente."
    },
    {
      id: 4,
      titulo: "Depósito",
      descripcion: "Recibe el dinero en tu cuenta y úsalo para lo que necesites."
    }
  ];

  return (
    <section className="como-funciona">
      <div className="como-funciona-container">
        
        <div className="section-badge">
          <h2>¿Cómo funciona?</h2>
        </div>

        <p className="steps-intro">Obtener tu crédito es un proceso sencillo de 4 pasos:</p>

        {/* Lista de Pasos */}
        <div className="steps-list">
          {pasos.map((paso) => (
            <div key={paso.id} className="step-item">
              <span className="step-number">{paso.id}</span>
              <p>
                <strong>{paso.titulo}:</strong> {paso.descripcion}
              </p>
            </div>
          ))}
        </div>

        {/* Tabla de Información (Nombre de Producto / RECA) */}
     <div className="info-grid-table">
          {/* Fila de Encabezados (Naranjas) */}
          <div className="table-cell header-orange">Nombre del producto</div>
          <div className="table-cell header-orange">Número de RECA</div>
          
          {/* Fila de Contenido (Verdes) */}
          <div className="table-cell body-green">Crédito de Nómina</div>
          <div className="table-cell body-green">
          </div>
        </div>
      </div>
    </section>
  );
};