// src/utils/Propiedades.js
import SIPRES from '../assets/images/SIPRES.svg';
import CONDUSEF from '../assets/images/CONDUSEF.svg';
import CNBV from '../assets/images/CNBV.svg';
import BURO from '../assets/images/BANCO DE MÉXICO.svg';

export const ENTIDAD_CONFIG = {
  // --- DATOS FISCALES Y LEGALES ---
  NOMBRE_RAZON_SOCIAL: "HRH 2022, S.A.P.I DE C.V., SOFOM, E.N.R.",
  // --- DATOS FISCALES Y LEGALES ---
  DOMICILIO_FISCAL: "AVENIDA DE LA CALMA 3483 - E, COL. LA CALMA, C.P. 45070, ZAPOPAN, JALISCO.\nREFERENCIA: FRENTE AL PARQUE LA CALMA, ENTRE CALLE GEMELOS Y CALLE CARNERO",
  
  // --- UNIDAD ESPECIALIZADA (UNE) ---
  UNE_TITULAR: "HUMBERTO HERNNADEZ SERUR",
  UNE_CORREO: "HRH_2022@outlook.es",
  UNE_TELEFONO: "3334572113",
  // UNE_HORARIO: "Lunes a Viernes de 09:00 a 18:00 hrs.",

  // --- CONTACTO PÚBLICO ---
  CONTACTO_CORREO: "administrador@credigo.com.mx",
  CONTACTO_CORREO2: "clientes@credigo.com.mx",
  CONTACTO_WHATSAPP: "523318960436",
  CONTACTO_TEL_VUE: "33 1896 0436",

  // --- RECURSOS Y LOGOS (Rutas relativas a /public) ---
  LOGOS: {
    SIPRES: SIPRES,
    CONDUSEF: CONDUSEF,
    CNBV: CNBV,
    BURO: BURO,
  },

  // --- REGISTROS Y LINKS OFICIALES ---
  NUMERO_RECA: "1234-439-034567/01-05432",
  LINK_CONDUSEF: "https://www.condusef.gob.mx",
  LINK_BURO: "https://www.buro.gob.mx",
  SITE_URL: "https://www.hrh2022.mx",
  
  // --- DINÁMICOS ---
  YEAR: new Date().getFullYear().toString(),

  // --- LEYENDAS LEGALES Y REGULATORIAS (SOFOM E.N.R. COMPLIANCE) ---
  LEYENDAS: {
    SHCP_5_1: "Para la Constitución y Operación de HRH 2022, S.A.P.I. de C.V., SOFOM, E.N.R., no requiere de autorización de la Secretaría de Hacienda y Crédito Público.",
    CNBV_5_2: "HRH 2022, S.A.P.I. de C.V., SOFOM, E.N.R. está sujeta a la supervisión de la Comisión Nacional Bancaria y de Valores, únicamente para efectos de lo dispuesto por el artículo 56 de la Ley General de Organizaciones y Actividades Auxiliares del Crédito.",
    CNBV_5_3: "En lo que respecta a las Sociedades Financieras de Objeto Múltiple no Reguladas, los centros cambiarios y los transmisores de dinero, la inspección y vigilancia de estas sociedades se llevará a cabo por la Comisión Nacional Bancaria y de Valores, exclusivamente para verificar el cumplimiento de los preceptos a que se refiere el artículo 95 Bis de la Ley General de Organizaciones y Actividades Auxiliares del Crédito y las disposiciones de carácter general que de este deriven.",
    BURO_5_4: "El Buró de Entidades Financieras contiene información de HRH 2022, S.A.P.I. de C.V. SOFOM E.N.R. sobre las características de nuestros productos y nuestro desempeño frente a los Usuarios en la prestación de servicios. Te invitamos a consultarlo en la página https://www.buro.gob.mx/ o en nuestra página de internet https://www.hrh2022.mx/.",
    CAT_5_5: "CAT: El Costo Anual Total de financiamiento expresado en términos porcentuales anuales que, para fines informativos y de comparación, incorpora la totalidad de los costos y gastos inherentes a los créditos.",
    MORTGAGE_5_6: "Es tu derecho solicitar la oferta vinculante para comparar distintas opciones de crédito.",
    TASA_VARIABLE_5_7: "Al ser tu crédito de tasa variable, los intereses pueden aumentar.",
    AVAL_5_8: "El avalista, obligado solidario o coacreditado responderá como obligado principal por el total del pago frente a la Entidad Financiera.",
    UNE_5_9: (domicilio, correo, tel) => `HRH 2022, S.A.P.I. de C.V. SOFOM E.N.R. recibe las consultas, reclamaciones o aclaraciones, en su Unidad Especializada de Atención a Usuarios, ubicada en ${domicilio} y por correo electrónico ${correo} o teléfono ${tel}, así como en cualquiera de sus sucursales u oficinas. En el caso de no obtener una respuesta satisfactoria, podrá acudir a CONDUSEF (www.condusef.gob.mx / 01 800 999 8080 y 53 40 09 99).`,
    CONDUSEF_TITLE: "Comisión Nacional para la Protección y Defensa de los Usuarios de Servicios Financieros (CONDUSEF)",
    CONDUSEF_CONTACT: "Teléfono: 01 800 999 8080 y 53 40 09 99 | Página de Internet: www.condusef.gob.mx"
  }
};


export const REGLAS_NEGOCIO = {
    personal: {
        minMonto: 5000,
        maxMonto: 50000,
        minPlazo: 6,
        maxPlazo: 24,
        tasaMensual: 0.04 
    },
    auto: {
        minMonto: 50000,
        maxMonto: 500000,
        minPlazo: 12,
        maxPlazo: 48,
        tasaMensual: 0.0125
    }
};

export const ESTADOS_MEXICO = [
    "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", 
    "Chihuahua", "Ciudad de México", "Coahuila", "Colima", "Durango", "Estado de México", 
    "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Michoacán", "Morelos", "Nayarit", 
    "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", 
    "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
];

export const PAISES_VIGENTES = [
    "MÉXICO", "ESTADOS UNIDOS", "CANADÁ", "OTRO"
];