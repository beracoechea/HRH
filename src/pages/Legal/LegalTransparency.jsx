import React from 'react';
import { FiDownload, FiFileText, FiCheckCircle } from 'react-icons/fi';
import './LegalTransparency.css';

const LegalTransparency = () => {
  const documents = [
    { title: "Aviso de Privacidad Vigente", file: "/docs/aviso-privacidad.pdf", date: "Actualizado: Enero 2026" },
    { title: "Términos y Condiciones de Uso", file: "/docs/terminos-condiciones.pdf", date: "Actualizado: Enero 2026" },
    { title: "Contrato de Adhesión (RECA)", file: "/docs/contrato-reca.pdf", id: "Registro: 1234-439-034567/01-05432", date: "Vigente" }
  ];

  return (
    <div className="legal-container">
      <h1>Transparencia y Normatividad</h1>
      <p className="legal-intro">
        En cumplimiento con las disposiciones de la CONDUSEF y la CNBV, ponemos a su disposición los documentos legales que rigen nuestros servicios.
      </p>

      <div className="legal-grid">
        {documents.map((doc, index) => (
          <div key={index} className="legal-card">
            <FiFileText className="legal-icon" />
            <h3>{doc.title}</h3>
            {doc.id && <span className="reca-number">{doc.id}</span>}
            <p>{doc.date}</p>
            <a href={doc.file} download className="btn-download">
              <FiDownload /> Descargar PDF
            </a>
          </div>
        ))}
      </div>
      
      <div className="compliance-badge">
        <FiCheckCircle /> Entidad supervisada por la CNBV y registrada en el SIPRES.
      </div>
    </div>
  );
};

export default LegalTransparency;