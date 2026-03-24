import React from 'react';
import { FiArrowRight } from 'react-icons/fi';
import styles from './Expedientes.module.css';

export const Expedientes = () => {
  const requisitos = [
    { titulo: "Identificación Oficial:", detalle: "INE o Pasaporte vigente (por ambos lados)." },
    { titulo: "Comprobante de domicilio:", detalle: "Recibo de luz, agua o teléfono (no mayor a 3 meses)." },
    { titulo: "CURP:", detalle: "Formato actualizado." },
    { titulo: "Constancia de Situación Fiscal:", detalle: "Documento vigente emitido por el SAT." },
    { titulo: "Documentación adicional:", detalle: "Solo si aplica en tu empresa, el Acuse de firma electrónica." },
  ];

  return (
    <section className={styles.expedientesContainer}>
      <div className={styles.bubbleIntro}>
        <p>
          Para completar tu expediente y recibir una respuesta en <strong>48 horas</strong>, 
          asegúrate de tener digitalizados los siguientes documentos junto con tus formatos firmados:
        </p>
      </div>

      <ul className={styles.requisitosList}>
        {requisitos.map((item, index) => (
          <li key={index} className={styles.requisitoItem}>
            <FiArrowRight className={styles.arrowIcon} />
            <p>
              <strong>{item.titulo}</strong> {item.detalle}
            </p>
          </li>
        ))}
      </ul>

      <div className={styles.divider}></div>

      <div className={styles.tipBox}>
        <FiArrowRight className={styles.tipArrow} />
        <p>
          <strong>Tip:</strong> Envía tus documentos en formato PDF o fotografía legible para agilizar el análisis de nuestra Mesa de Control.
        </p>
      </div>
    </section>
  );
};