export const COMPANY_FISCAL_INFO = {
    razonSocial: "HRH 2022",
    regimenCapital: "SOCIEDAD ANONIMA PROMOTORA DE INVERSION DE CAPITAL VARIABLE, SOCIEDAD FINANCIERA DE OBJETO MULTIPLE, ENTIDAD NO REGULADA",
    nombreComercial: "HRH 2022",
    rfc: "HDM220314Q24",
    domicilio: {
        calle: "AVENIDA DE LAS AMERICAS",
        numeroExterior: "1930",
        numeroInterior: "PISO 11 UNIDAD B5",
        colonia: "COUNTRY CLUB",
        cp: "44610",
        municipio: "GUADALAJARA",
        estado: "JALISCO",
        referencia: "Entre AVENIDA PATRIA y AVENIDA BRASILIA"
    },
    telefono: "(33) 1273 3966", // default
    email: "contacto@hrh2022.mx", // default provisional
    web: "hrh2022.mx", // default provisional
    registroContrato: "17095-439-043075/01-03213-1125" // provisional para SOFOM
};

export const getFiscalAddressString = () => {
    const { calle, numeroExterior, numeroInterior, colonia, municipio, estado, cp } = COMPANY_FISCAL_INFO.domicilio;
    return `${calle} ${numeroExterior} ${numeroInterior}, Col. ${colonia}, ${municipio}, ${estado}, C.P. ${cp}`;
};
