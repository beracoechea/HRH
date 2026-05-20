import React from 'react';
import { FiDownload, FiCheckCircle, FiAward } from 'react-icons/fi';

const LegalServices = () => {

  // Arreglo de datos enriquecido con información real de tus documentos
  const servicesData = [
    {
      id: 'cuenta_corriente',
      title: 'Crédito Maestro en Cuenta Corriente',
      reca: 'RECA: 16338-440-039352/03-01096-0526',
      description: 'Línea de crédito revolvente diseñada para el financiamiento continuo de capital de trabajo mediante disposiciones parciales con amortización mensual.',
      features: [
        'Disposición revolvente vía transferencia electrónica.',
        'Interés ordinario calculado sobre saldos insolutos (base de 360 días).',
        'Garantía prendaria sin transmisión de la posesión.'
      ],
      pdfPath: '/docs/Contrato_HRH_GENERICO_RECA_Sin CC.pdf', 
      pdfName: 'HRH2022_CONTRATO_CUENTA_CORRIENTE_RECA.pdf'
    },
    {
      id: 'automotriz',
      title: 'Crédito Simple Automotriz (Auto Go)',
      reca: 'RECA: 16338-139-043332/01-00248-0126',
      description: 'Financiamiento directo con título ejecutivo destinado exclusivamente a la adquisición de vehículos, optimizado con esquemas de seguridad tecnológica.',
      features: [
        'Tasa anual variable referenciada a la TIIE de 28 días.',
        'Monitoreo obligatorio mediante dispositivo de localización GPS.',
        'Garantía prendaria sobre el vehículo con opción de inhabilitación remota.'
      ],
      pdfPath: '/docs/CONTRATO CREDITO SIMPLE AUTOMOTRIZ HRH 2022-AUTO GO.pdf',
      pdfName: 'HRH2022_CREDITO_AUTOMOTRIZ_RECA.pdf'
    },
    {
      id: 'domiciliacion',
      title: 'Crédito Simple con Domiciliación',
      reca: 'RECA: 16338-439-043326/01-00246-0126',
      description: 'Financiamiento de liquidez inmediata enfocado en la agilidad de cobro mediante cargos automatizados recurrentes a cuentas bancarias autorizadas.',
      features: [
        'Amortizaciones fijas mediante cargo directo a tarjeta de débito.',
        'Validación obligatoria de identidad digital mediante biométricos (INE).',
        'Cero penalizaciones por pagos anticipados o liquidación adelantada.'
      ],
      pdfPath: '/docs/SIMPLE CON DOMICILIACION Contrato (2).pdf',
      pdfName: 'HRH2022_CREDITO_DOMICILIACION_RECA.pdf'
    },
    {
      id: 'prendaria',
      title: 'Crédito Simple con Garantía Prendaria',
      reca: 'RECA: 16338-439-043275/01-00119-0126',
      description: 'Crédito corporativo y personal estructurado bajo condiciones convencionales estrictas, respaldado por un aforo de bienes muebles.',
      features: [
        'Tasa de interés ordinario fija estipulada en la carátula.',
        'Inscripción obligatoria de las garantías ante el RUG de la Secretaría de Economía.',
        'Retención opcional de fondo o garantía líquida sobre el desembolso.'
      ],
      pdfPath: '/docs/Contrato HRH 2022 Credito Simple con Garantía Prendaria.pdf',
      pdfName: 'HRH2022_CREDITO_GARANTIA_PRENDARIA_RECA.pdf'
    },
    {
      id: 'fiduciaria',
      title: 'Crédito Simple con Garantía Fiduciaria',
      reca: 'RECA: 16338-439-039353/02-01013-0425',
      description: 'Esquema de financiamiento de gran escala estructurado para empresas y corporativos que integran obligados solidarios y fideicomisos como respaldo.',
      features: [
        'Contrato maestro apto para fondeos interbancarios o recursos FIRA.',
        'Respaldo combinado de fianza mercantil, prenda y fideicomiso de garantía.',
        'Intereses moratorios estándar no capitalizables calculados al doble de la tasa.'
      ],
      pdfPath: '/docs/CONTRATO HRH CREDITO SIMPLE VF.pdf',
      pdfName: 'HRH2022_CREDITO_GARANTIA_FIDUCIARIA_RECA.pdf'
    },
    {
      id: 'fideicomiso',
      title: 'Fideicomiso Maestro "Productividad Empresarial"',
      reca: 'Contrato No: 16338-006-043656/01-00759-0426',
      description: 'Vehículo fiduciario transparente en garantía y fuente de pago, diseñado para la administración de incentivos y programas de competitividad laboral.',
      features: [
        'Absoluta transparencia fiscal (sin actividad empresarial directa).',
        'Adhesión dinámica de fideicomitentes y trabajadores beneficiarios.',
        'Cláusula de reversión patrimonial y protección irrevocable del fondo.'
      ],
      pdfPath: '/docs/Fideicomiso Maestro Formato 2026 HRH 2022 (1).pdf',
      pdfName: 'HRH2022_FIDEICOMISO_MAESTRO_GARANTIA.pdf'
    }
  ];

  const handleDownloadInternalPDF = (pdfUrl, fileName) => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="services-wrapper">
      <p className="services-intro">
        En cumplimiento con las disposiciones de transparencia de la <strong>CONDUSEF</strong> y la normativa vigente para Sociedades Financieras de Objeto Múltiple (SOFOM E.N.R.), ponemos a disposición del público e inversionistas las descargas oficiales de nuestros contratos de adhesión vigentes.
      </p>

      <div className="services-grid">
        {servicesData.map((card) => (
          <div className="service-card" key={card.id}>
            <div className="card-badge">{card.reca.split('/')[0]}</div>
            <h3>{card.title}</h3>
            <p className="card-desc">{card.description}</p>
            
            <div className="card-features">
              <h5>Especificaciones del registro:</h5>
              <ul>
                {card.features.map((feat, idx) => (
                  <li key={idx}>
                    <FiCheckCircle className="feat-icon" /> {feat}
                  </li>
                ))}
              </ul>
            </div>

            <button 
              className="btn-card-download" 
              onClick={() => handleDownloadInternalPDF(card.pdfPath, card.pdfName)}
            >
              <FiDownload /> Descargar Contrato Oficial
            </button>
          </div>
        ))}
      </div>

      <div className="legal-quote-box services-footer-note">
        <FiAward className="note-icon" />
        <span> Todos los modelos contractuales descargables corresponden a las versiones oficiales autorizadas e inscritas en el Registro de Contratos de Adhesión (RECA) de la CONDUSEF.</span>
      </div>
    </div>
  );
};

export default LegalServices;