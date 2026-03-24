// src/utils/Propiedades.js

export const ENTIDAD_CONFIG = {
  // --- DATOS FISCALES Y LEGALES ---
  NOMBRE_RAZON_SOCIAL: "CrediGo S.A. de C.V., SOFOM, E.N.R.",
  DOMICILIO_FISCAL: "Av. Interlomas 100, Col. Centro, CP 44100, Guadalajara, Jal.",
  
  // --- UNIDAD ESPECIALIZADA (UNE) ---
  UNE_TITULAR: "Lic. Juan Pérez García",
  UNE_CORREO: "une@credigo.com",
  UNE_TELEFONO: "3312345678",
  UNE_HORARIO: "Lunes a Viernes de 09:00 a 18:00 hrs.",

  // --- CONTACTO PÚBLICO ---
  CONTACTO_CORREO: "contacto@credigo.com",
  CONTACTO_WHATSAPP: "523312345678", // Sin espacios ni símbolos para el link
  CONTACTO_TEL_VUE: "33 1234 5678",   // Formato estético para el usuario

  // --- RECURSOS Y LOGOS (Rutas relativas a /public) ---
  LOGOS: {
    SIPRES: "/logos/sipres.png",
    CNBV: "/logos/cnbv.png",
    BURO: "/logos/buro.png",
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