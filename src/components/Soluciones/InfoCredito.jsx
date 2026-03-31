import React from 'react';
import { FiTag, FiCalendar, FiDollarSign, FiPercent, FiClock, FiBriefcase,FiUser,FiCheckCircle } from 'react-icons/fi';
import './InfoCredito.css';

export const InfoCredito = () => {
  const productos = [
    {
      categoria: "Crédito Personal",
      descripcion: "Ideal para gastos imprevistos, viajes o consolidación de deudas.",
      opciones: [
        {
          nombre: "Go Personal",
          subtitulo: "Crédito Abierto",
          reca: "PENDIENTE",
          plazo: "12 a 48 meses",
          monto: "$5,000 - $50,000",
          tasa: "3% al 8% anual",
          gracia: "1er año pago de capital",
          comision: "0%",
          frecuencia: "Mensual",
          icon: <FiUser className="prod-icon" />
        },
        {
          nombre: "Go Nómina",
          subtitulo: "Con Convenio",
          reca: "PENDIENTE",
          plazo: "12 a 48 meses",
          monto: "$5,000 - $50,000",
          tasa: "3% al 8% anual",
          gracia: "1er año pago de capital",
          comision: "0%",
          frecuencia: "Semanal o Quincenal (Vía Nómina)",
          icon: <FiBriefcase className="prod-icon" />,
          destacado: true
        }
      ]
    },
    {
      categoria: "Crédito Automotriz",
      descripcion: "Financiamiento para adquirir el vehículo que necesitas con plazos cómodos.",
      opciones: [
        {
          nombre: "Go Auto",
          subtitulo: "Crédito Abierto",
          reca: "PENDIENTE",
          plazo: "12 a 72 meses",
          monto: "$50,000 - $500,000",
          tasa: "1.25% a 6%",
          gracia: "1er año pago de capital",
          comision: "0%",
          frecuencia: "Mensual"
        },
        {
          nombre: "Go Auto (Convenio)",
          subtitulo: "Beneficios Exclusivos Colaboradores",
          reca: "PENDIENTE",
          plazo: "12 a 72 meses",
          monto: "$50,000 - $500,000",
          tasa: "0.9% al 5%",
          gracia: "1er año pago de capital",
          comision: "0%",
          frecuencia: "Semanal o Quincenal (Vía Nómina)",
          destacado: true
        }
      ]
    }
  ];

  return (
    <section className="info-credito">
      <div className="info-container">
        {productos.map((seccion, idx) => (
          <div key={idx} className="product-section">
            <div className="section-header">
              <h2>{seccion.categoria}</h2>
              <p>{seccion.descripcion}</p>
            </div>

            <div className="product-grid">
              {seccion.opciones.map((prod, pIdx) => (
                <div key={pIdx} className={`product-card ${prod.destacado ? 'featured' : ''}`}>
                  {prod.destacado && <span className="badge-convenio">Convenio</span>}
                  <div className="card-top">
                    <span className="reca-tag">RECA: {prod.reca}</span>
                    <h3>{prod.nombre}</h3>
                    <p className="sub">{prod.subtitulo}</p>
                  </div>
                  
                  <div className="specs-list">
                    <div className="spec-item">
                      <FiCalendar /> <span><strong>Plazo:</strong> {prod.plazo}</span>
                    </div>
                    <div className="spec-item">
                      <FiDollarSign /> <span><strong>Monto:</strong> {prod.monto}</span>
                    </div>
                    <div className="spec-item">
                      <FiPercent /> <span><strong>Tasa:</strong> {prod.tasa}</span>
                    </div>
                    <div className="spec-item">
                      <FiClock /> <span><strong>Gracia:</strong> {prod.gracia}</span>
                    </div>
                    <div className="spec-item">
                      <FiTag /> <span><strong>Apertura:</strong> {prod.comision}</span>
                    </div>
                    <div className="spec-item">
                      <FiCheckCircle /> <span><strong>Pago:</strong> {prod.frecuencia}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};