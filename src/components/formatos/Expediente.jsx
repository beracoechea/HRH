import React from 'react';
import { FiArrowRight, FiCheckCircle, FiInfo } from 'react-icons/fi';
import styles from './Expedientes.module.css';

export const Expedientes = () => {
  const creditos = [
    {
      tipo: "Crédito Personal",
      items: [
        "Identificación oficial vigente.",
        "Comprobante de ingresos reciente.",
        "Comprobante de domicilio.",
        "Constancia de situación fiscal.",
        "Comprobante de nómina o estados de cuenta.*",
        "Solicitud de crédito.",
        "Aceptación de Consulta en Buró de Crédito."
      ]
    },
    {
      tipo: "Crédito Automotriz",
      items: [
        "Identificación oficial vigente.",
        "Comprobante de ingresos reciente.",
        "Comprobante de domicilio.",
        "Constancia de situación fiscal.",
        "Comprobante de nómina o estados de cuenta.*",
        "Factura del automóvil.",
        "Fotografías del automóvil.",
        "Tarjeta de circulación del automóvil.",
        "Solicitud de crédito.",
        "Aceptación de Consulta en Buró de Crédito."
      ]
    }
  ];

  return (
    <section className={styles.expedientesContainer}>
      <div className={styles.bubbleIntro}>
        <p>
          Para completar tu expediente y recibir una respuesta en <strong>48 horas</strong>, 
          asegúrate de tener digitalizados los siguientes documentos:
        </p>
      </div>

      <div className={styles.creditosGrid}>
        {creditos.map((credito, idx) => (
          <div key={idx} className={styles.creditoCard}>
            <h3 className={styles.creditoTitle}>
              <FiCheckCircle className={styles.titleIcon} /> {credito.tipo}
            </h3>
            <ul className={styles.requisitosList}>
              {credito.items.map((item, index) => (
                <li key={index} className={styles.requisitoItem}>
                  <FiArrowRight className={styles.arrowIcon} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className={styles.notaConvenio}>
        <FiInfo className={styles.infoIcon} />
        <p>
          *Si eres colaborador de empresas con convenio <strong>no requieren</strong> entregar esta documentación (nómina o estados de cuenta).
        </p>
      </div>

      <div className={styles.tipBox}>
        <FiArrowRight className={styles.tipArrow} />
        <p>
          <strong>Tip:</strong> Envía tus documentos en formato PDF o fotografía legible para agilizar el análisis de nuestra Mesa de Control.
        </p>
      </div>
    </section>
  );
};