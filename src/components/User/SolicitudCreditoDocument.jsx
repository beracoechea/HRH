import React from 'react';

const SectionHeader = ({ title }) => (
    <div style={{
        backgroundColor: '#159082',
        color: 'white',
        padding: '4px 10px',
        fontSize: '8pt',
        fontWeight: 'bold',
        marginTop: '15px',
        textTransform: 'uppercase'
    }}>
        {title}
    </div>
);

const TableCell = ({ label, value, width = '100%' }) => (
    <div style={{
        border: '1px solid #94a3b8',
        padding: '4px 6px',
        width: width,
        boxSizing: 'border-box',
        minHeight: '35px'
    }}>
        <div style={{ fontSize: '6.5pt', color: '#64748b', fontWeight: 'bold', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '8.5pt', color: '#1e293b', minHeight: '14px' }}>{value}</div>
    </div>
);

export const SolicitudCreditoDocument = () => {
    return (
        <div style={{
            padding: '30px',
            backgroundColor: 'white',
            color: '#000',
            fontFamily: "'Inter', sans-serif",
            maxWidth: '850px',
            margin: '0 auto',
            lineHeight: '1.2'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                    <div style={{ color: '#159082', fontSize: '22px', fontWeight: 'bold' }}>CREDIGO</div>
                    <div style={{ fontSize: '9pt', fontWeight: 'bold' }}>SOLICITUD DE CRÉDITO PERSONA FÍSICA - NÓMINA</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '8pt', fontWeight: 'bold' }}>FECHA: <span style={{ borderBottom: '1px solid #000', minWidth: '100px', display: 'inline-block' }}></span></div>
                </div>
            </div>

            {/* 1. CONTROL */}
            <SectionHeader title="1. DATOS DE CONTROL Y ORIGEN" />
            <div style={{ display: 'flex' }}>
                <TableCell label="FECHA DE SOLICITUD" value="" width="20%" />
                <TableCell label="SUCURSAL / CANAL" value="" width="30%" />
                <TableCell label="¿CÓMO SE ENTERÓ?" value="[ ] Internet  [ ] Redes  [ ] Tel  [ ] Otro" width="50%" />
            </div>

            {/* 2. PERSONALES */}
            <SectionHeader title="2. DATOS DEL SOLICITANTE" />
            <div style={{ display: 'flex' }}>
                <TableCell label="APELLIDO PATERNO" value="" width="33.3%" />
                <TableCell label="APELLIDO MATERNO" value="" width="33.3%" />
                <TableCell label="NOMBRE(S)" value="" width="33.3%" />
            </div>
            <div style={{ display: 'flex' }}>
                <TableCell label="RFC CON HOMOCLAVE" value="" width="25%" />
                <TableCell label="CURP" value="" width="35%" />
                <TableCell label="FECHA NACIMIENTO" value="" width="20%" />
                <TableCell label="ESTADO CIVIL" value="" width="20%" />
            </div>
            <div style={{ display: 'flex' }}>
                <TableCell label="NACIONALIDAD" value="" width="25%" />
                <TableCell label="GÉNERO" value="[ ] M  [ ] F" width="20%" />
                <TableCell label="GRADO DE ESTUDIOS" value="" width="30%" />
                <TableCell label="DEPENDIENTES ECON." value="" width="25%" />
            </div>

            {/* 3. DOMICILIO */}
            <SectionHeader title="3. DATOS DE DOMICILIO PARTICULAR" />
            <div style={{ display: 'flex' }}>
                <TableCell label="CALLE Y NÚMERO (EXT/INT)" value="" width="65%" />
                <TableCell label="COLONIA" value="" width="35%" />
            </div>
            <div style={{ display: 'flex' }}>
                <TableCell label="C.P." value="" width="15%" />
                <TableCell label="MUNICIPIO / ALCALDÍA" value="" width="30%" />
                <TableCell label="ESTADO" value="" width="30%" />
                <TableCell label="CIUDAD" value="" width="25%" />
            </div>

            {/* 4. LABORALES */}
            <SectionHeader title="4. INFORMACIÓN LABORAL (NÓMINA)" />
            <div style={{ display: 'flex' }}>
                <TableCell label="EMPRESA / DEPENDENCIA" value="" width="65%" />
                <TableCell label="MATRÍCULA / NUM. EMPLEADO" value="" width="35%" />
            </div>
            <div style={{ display: 'flex' }}>
                <TableCell label="PUESTO / CARGO" value="" width="35%" />
                <TableCell label="FECHA INGRESO" value="" width="20%" />
                <TableCell label="ANTIGÜEDAD (A/M)" value="" width="20%" />
                <TableCell label="PERIODICIDAD" value="[ ] Q  [ ] S  [ ] M" width="25%" />
            </div>
            <div style={{ display: 'flex' }}>
                <TableCell label="TEL. OFICINA" value="" width="25%" />
                <TableCell label="EXT." value="" width="15%" />
                <TableCell label="DIRECCIÓN DE LA EMPRESA" value="" width="60%" />
            </div>

            {/* 5. CREDITO Y BANCO */}
            <SectionHeader title="5. CRÉDITO Y DATOS DE DEPÓSITO" />
            <div style={{ display: 'flex' }}>
                <TableCell label="IMPORTE SOLICITADO" value="" width="25%" />
                <TableCell label="PLAZO (MESES)" value="" width="15%" />
                <TableCell label="INSTITUCIÓN BANCARIA" value="" width="25%" />
                <TableCell label="CLABE INTERBANCARIA (18 DÍGITOS)" value="" width="35%" />
            </div>

            {/* 6. REFERENCIAS */}
            <SectionHeader title="6. REFERENCIAS PERSONALES" />
            {[1, 2].map(i => (
                <div key={i} style={{ display: 'flex' }}>
                    <TableCell label={`NOMBRE REFERENCIA ${i}`} value="" width="50%" />
                    <TableCell label="PARENTESCO" value="" width="25%" />
                    <TableCell label="TELÉFONO" value="" width="25%" />
                </div>
            ))}

            {/* 7. LEGAL */}
            <SectionHeader title="7. DECLARACIONES Y AUTORIZACIÓN" />
            <div style={{ 
                border: '1px solid #94a3b8', 
                padding: '10px', 
                fontSize: '7.5pt', 
                textAlign: 'justify',
                color: '#334155'
            }}>
                <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    AUTORIZACIÓN DE DESCUENTO IRREVOCABLE: El suscrito autoriza irrevocablemente a su empleador a descontar de su nómina las cantidades correspondientes a las amortizaciones del crédito aquí solicitado...
                </p>
                <p>
                    Manifiesto que los fondos proceden de actividades lícitas y autorizo a HRH 2022 para realizar investigaciones en Sociedades de Información Crediticia.
                </p>
            </div>

            {/* Firmas */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                <div style={{ textAlign: 'center', width: '40%' }}>
                    <div style={{ borderTop: '1px solid #000', paddingTop: '5px', fontSize: '8pt', fontWeight: 'bold' }}>SOLICITANTE</div>
                </div>
                <div style={{ textAlign: 'center', width: '40%' }}>
                    <div style={{ borderTop: '1px solid #000', paddingTop: '5px', fontSize: '8pt', fontWeight: 'bold' }}>FUNCIONARIO HRH</div>
                </div>
            </div>
        </div>
    );
};
