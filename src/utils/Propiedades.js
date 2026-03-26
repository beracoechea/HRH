// src/utils/Propiedades.js

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
  CONTACTO_CORREO: "contacto@credigo.com",
  CONTACTO_WHATSAPP: "523312345678",
  CONTACTO_TEL_VUE: "33 1234 5678",

  // --- RECURSOS Y LOGOS (Rutas relativas a /public) ---
  LOGOS: {
    SIPRES: "/src/assets/images/SIPRES.svg",
    CONDUSEF: "/src/assets/images/CONDUSEF.svg",
    CNBV: "/src/assets/images/CNBV.svg",
    BURO: "/src/assets/images/BANCO DE MÉXICO.svg",
  },

  // --- REGISTROS Y LINKS OFICIALES ---
  NUMERO_RECA: "1234-439-034567/01-05432",
  LINK_CONDUSEF: "https://www.condusef.gob.mx",
  LINK_BURO: "https://www.buro.gob.mx",
  
  // --- DINÁMICOS ---
  YEAR: new Date().getFullYear().toString()
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