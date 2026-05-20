import React, { useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { FiFileText, FiShield, FiInfo, FiChevronRight, FiDownload, FiCheckCircle, FiPrinter, FiBriefcase } from 'react-icons/fi';
import './LegalTransparency.css';
import LegalServices from './LegalService';

const LegalTransparency = () => {
  const [activeTab, setActiveTab] = useState('terminos');
  const [isDownloading, setIsDownloading] = useState(false);
  const pdfRef = useRef(null);

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    const element = pdfRef.current;
    const date = new Date().toLocaleDateString('es-MX').replace(/\//g, '-');

    const opt = {
      margin: [15, 15, 15, 15],
      filename: `HRH2022_${activeTab.toUpperCase()}_${date}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setIsDownloading(false);
    });
  };

  const docsContent = {
    terminos: {
      title: "Términos y Condiciones del Sitio Web",
      date: "26 de marzo de 2026",
      content: (
        <div className="legal-text-body">
          <p>Los presentes Términos y Condiciones regulan el acceso y uso del sitio web <strong>https://hrh2022.web.app/</strong> (en adelante, el "Sitio"), propiedad de HRH 2022, S.A.P.I. DE C.V., SOFOM, E.N.R.</p>
          
          <h4>1. IDENTIDAD Y LEYENDA LEGAL OBLIGATORIA</h4>
          <p>HRH 2022 es una Sociedad Financiera de Objeto Múltiple, Entidad No Regulada. En cumplimiento con el Artículo 87-J de la Ley de Organizaciones y Actividades Auxiliares del Crédito, se informa lo siguiente:</p>
          <div className="legal-quote-box">
            "Para su constitución y operación como Sociedad Financiera de Objeto Múltiple, Entidad No Regulada, HRH 2022, S.A.P.I. de C.V. no requiere autorización de la Secretaría de Hacienda y Crédito Público, y únicamente está sujeta a la supervisión de la Comisión Nacional Bancaria y de Valores, exclusivamente para efectos del Artículo 95-Bis de la citada Ley."
          </div>

          <h4>2. OBJETO E INFORMACIÓN</h4>
          <p>El Sitio tiene como finalidad principal proporcionar información sobre los servicios financieros relacionados con la financiera rural y otros productos de crédito ofrecidos por la entidad. La información contenida en este Sitio no constituye una oferta vinculante ni asesoría financiera personalizada; la contratación de cualquier producto estará sujeta a la firma del contrato de adhesión correspondiente.</p>

          <h4>3. DATOS DE IDENTIFICACIÓN FISCAL</h4>
          <ul className="legal-data-list">
            <li><strong>Denominación Social:</strong> HRH 2022, S.A.P.I. DE C.V., SOFOM, E.N.R.</li>
            <li><strong>RFC:</strong> HDM220314Q24.</li>
            <li><strong>Domicilio:</strong> Avenida de la Calma número 3483, Interior E, Colonia La Calma, Zapopan, Jalisco, C.P. 45070.</li>
          </ul>

          <h4>4. RESTRICCIONES DE USO</h4>
          <p>El Usuario se obliga a utilizar el Sitio conforme a la buena fe y las leyes vigentes. Queda prohibido:</p>
          <ul>
            <li>Utilizar el Sitio para actividades ilícitas o contrarias al orden público.</li>
            <li>Reproducir, copiar o distribuir cualquier contenido sin autorización expresa.</li>
            <li>Intentar vulnerar la seguridad del Sitio o realizar técnicas de web scraping.</li>
          </ul>

          <h4>5. PROPIEDAD INTELECTUAL</h4>
          <p>Todas las marcas, logotipos, designs, software y contenidos publicados en este Sitio son propiedad exclusiva de HRH 2022 o cuenta con las licencias necesarias para su uso.</p>

          <h4>7. UNIDAD ESPECIALIZADA (UNE) Y ATENCIÓN</h4>
          <div className="une-box">
            <p><strong>Ubicación:</strong> Avenida Acueducto número 6050, interior 37, Zapopan, Jalisco.</p>
            <p><strong>Correo:</strong> administrador@credigo.com.mx</p>
            <p><strong>CONDUSEF:</strong> 55 53 400 999 | www.condusef.gob.mx</p>
          </div>
          
          <h4>9. JURISDICCIÓN Y LEY APLICABLE</h4>
          <p>Para todo lo relativo a la interpretación y cumplimiento de estos Términos, el Usuario se somete a las leyes federales de México y a los tribunales competentes de la ciudad de Guadalajara, Jalisco.</p>
        </div>
      )
    },
    privacidad: {
      title: "Aviso de Privacidad Integral",
      date: "26 de marzo de 2026",
      content: (
        <div className="legal-text-body">
          <p><strong>HRH 2022, S.A.P.I. DE C.V., SOFOM, E.N.R.</strong> responsable de la gestión e intervención de todo lo que respecta de la página web de la SOFOM, con domicilio en Avenida de la Calma 3483, Interior E, colonia La Calma, Zapopan, Jalisco, Código Postal 45070, es responsable del tratamiento, uso, protección y resguardo de sus datos personales, en cumplimiento de lo dispuesto por los artículos 14 y 15 de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares...</p>
          
          <h4>I.- Datos de identificación del responsable.</h4>
          <p>HRH 2022, S.A.P.I. DE C.V., a través de su Secretario General el C. ROMAN IÑIGUEZ ORTIZ. Correo electrónico de Contacto: administrador@credigo.com.mx</p>

          <h4>II.- Datos personales que se recaban.</h4>
          <ul>
            <li><strong>Datos de Identificación:</strong> Nombre completo, estado civil, fecha de nacimiento, nacionalidad, domicilio, teléfono, CURP, RFC e identificación oficial.</li>
            <li><strong>Datos Laborales:</strong> Ocupación, puesto, domicilio de trabajo.</li>
            <li><strong>Datos Patrimoniales:</strong> Información crediticia, ingresos y egresos, cuentas bancarias, bienes e historial crediticio.</li>
            <li><strong>Datos Personales Sensibles:</strong> Datos biométricos (reconocimiento facial, huella dactilar y voz) para garantizar seguridad y prevenir robo de identidad.</li>
          </ul>

          <h4>III.- Finalidades del tratamiento.</h4>
          <p><strong>Primarias:</strong> Otorgamiento de crédito, arrendamiento y factoraje; administración de cartera; evaluación de préstamos; cumplimiento de obligaciones legales como SOFOM E.N.R. (Prevención de Lavado de Dinero); Validación de identidad mediante biométricos.</p>
          <p><strong>Secundarias:</strong> Envío de publicidad, campañas de promoción y mercadotecnia.</p>

          <h4>V. Derechos ARCO y revocación del consentimiento.</h4>
          <div className="arco-box">
            <p>Usted tiene derecho al Acceso, Rectificación, Cancelación u Oposición. Dirija su solicitud a: <strong>administrador@credigo.com.mx</strong>. El Responsable dará respuesta en un plazo máximo de 20 días hábiles.</p>
          </div>

          <h4>IX. Contacto</h4>
          <p>Departamento de Protección de Datos Personales: Av. de la Calma 3483, Int. E, Zapopan, Jal. Horario: Lunes a viernes 09:00 a 18:00 hrs.</p>
        </div>
      )
    },
    cookies: {
      title: "Política de Cookies",
      date: "26 de marzo de 2026",
      content: (
        <div className="legal-text-body">
          <p>En HRH 2022 utilizamos cookies y tecnologías similares para garantizar el funcionamiento de nuestro Sitio Web y App, así como para fortalecer la seguridad de tus transacciones financieras.</p>
          
          <h4>2. Tipos de Cookies que utilizamos</h4>
          <table className="legal-table">
            <thead>
              <tr>
                <th>Tipo de Cookie</th>
                <th>Función</th>
                <th>¿Es obligatoria?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Técnicas / Necesarias</td>
                <td>Permiten la navegación y seguridad del portal.</td>
                <td>Sí</td>
              </tr>
              <tr>
                <td>De Preferencia</td>
                <td>Recuerdan idioma o región.</td>
                <td>No</td>
              </tr>
              <tr>
                <td>Analíticas</td>
                <td>Estadísticas para mejorar el servicio.</td>
                <td>No</td>
              </tr>
              <tr>
                <td>De Seguridad (Antifraude)</td>
                <td>Detectan patrones inusuales para proteger tu línea de crédito.</td>
                <td>Sí</td>
              </tr>
            </tbody>
          </table>

          <h4>4. Consentimiento y Control</h4>
          <p>Al ingresar, verás un "Banner de Cookies". Puedes aceptar todas o configurar tus preferencias. Nota: Si desactivas las de seguridad, ciertas funciones financieras podrían quedar inhabilitadas.</p>

          <h4>5. Deshabilitar manualmente</h4>
          <p>Configuración de navegador: Chrome (Privacidad y seguridad), Safari (Preferencias/Privacidad), Edge (Cookies y permisos).</p>
        </div>
      )
    },
    servicios: {
      title: "Transparencia de Productos y Servicios",
      date: "19 de mayo de 2026",
      content: <LegalServices />
    }
  }; // Corregido el cierre del objeto aquí

  return (
    <div className="legal-container animate-fade">
      <header className="legal-header">
        <h1>Centro de Transparencia</h1>
        <p>Documentación legal oficial de HRH 2022, S.A.P.I. de C.V.</p>
      </header>

      <div className="legal-layout">
        <aside className="legal-nav">
          <button className={activeTab === 'terminos' ? 'active' : ''} onClick={() => setActiveTab('terminos')}>
            <FiFileText /> Términos y Condiciones
            <FiChevronRight className="arrow" />
          </button>
          <button className={activeTab === 'privacidad' ? 'active' : ''} onClick={() => setActiveTab('privacidad')}>
            <FiShield /> Aviso de Privacidad
            <FiChevronRight className="arrow" />
          </button>
          <button className={activeTab === 'cookies' ? 'active' : ''} onClick={() => setActiveTab('cookies')}>
            <FiInfo /> Política de Cookies
            <FiChevronRight className="arrow" />
          </button>
          
          {/* Botón de Servicios Integrado */}
          <button className={activeTab === 'servicios' ? 'active' : ''} onClick={() => setActiveTab('servicios')}>
            <FiBriefcase /> Productos y Servicios
            <FiChevronRight className="arrow" />
          </button>

          <div className="compliance-sidebar-card">
            <FiCheckCircle />
            <span>Entidad supervisada por la CNBV y registrada ante SIPRES.</span>
          </div>
        </aside>

        <main className="legal-viewer">
          <div className="viewer-header">
            <div>
              <h2>{docsContent[activeTab].title}</h2>
              <span className="doc-date">Última actualización: {docsContent[activeTab].date}</span>
            </div>
            <button className="btn-download-pdf" onClick={handleDownloadPDF} disabled={isDownloading}>
              <FiDownload /> {isDownloading ? 'Generando PDF...' : 'Descargar PDF'}
            </button>
          </div>

          <div className="viewer-content" ref={pdfRef}>
            <div className="pdf-only-header">
              <div className="pdf-brand">HRH 2022 | CREDIGO</div>
              <div className="pdf-sub">{docsContent[activeTab].title}</div>
              <hr className="pdf-divider" />
            </div>
            <div className="legal-content-render">
              {docsContent[activeTab].content}
            </div>
            <div className="pdf-only-footer">
              <p>© {new Date().getFullYear()} HRH 2022, S.A.P.I. DE C.V., SOFOM, E.N.R.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LegalTransparency;