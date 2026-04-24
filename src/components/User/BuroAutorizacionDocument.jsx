import React from 'react';

const SectionHeader = ({ title }) => (
    <div style={{
        background: '#159082',
        color: 'white',
        padding: '2px 8px',
        fontSize: '9pt',
        fontWeight: 'bold',
        marginTop: '15px',
        marginBottom: '10px',
        textTransform: 'uppercase'
    }}>
        {title}
    </div>
);

const Field = ({ label, value }) => (
    <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '7pt', color: '#666', marginBottom: '1px' }}>{label}</div>
        <div style={{ borderBottom: '0.5px solid #000', fontSize: '9pt', minHeight: '1.2em' }}>{value}</div>
    </div>
);

export const BuroAutorizacionDocument = ({ userData = {}, id = 'buro-document' }) => {

    const {
        nombreCompleto = '',
        rfc = '',
        curp = '',
        calle = '',
        numExt = '',
        numInt = '',
        colonia = '',
        municipio = '',
        estado = '',
        cp = '',
        telefono = '',
        fechaActual = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()
    } = userData;

    const domicilioCompleto = `${calle} ${numExt} ${numInt ? 'Int. ' + numInt : ''}`.trim();

    return (
        <div id={id} style={{
            width: '215.9mm',
            height: '279mm',
            padding: '15mm 20mm',
            margin: '0',
            background: 'white',
            fontFamily: '"Times New Roman", Times, serif',
            fontSize: '10.5pt',
            color: '#000',
            lineHeight: '1.3',
            boxSizing: 'border-box',
            display: 'block',
            position: 'relative'
        }}>
            {/* 1. Header Box */}
            <div style={{
                border: '1px solid #000',
                padding: '10px',
                textAlign: 'center',
                marginBottom: '15px'
            }}>
                <div style={{ fontWeight: 'bold', fontSize: '10pt' }}>FORMATO DE AUTORIZACION DEFINIDO PARA SOFOM, E.N.R.</div>
                <div style={{ fontSize: '10pt' }}>Autorización para solicitar Reportes de crédito de personas físicas</div>
            </div>

            {/* 2. RECA Line */}
            <div style={{ textAlign: 'right', fontSize: '9pt', marginBottom: '15px' }}>
                NÚMERO RECA: <strong>16338-439-043275/01-00119-0126</strong>
            </div>

            {/* 3. Legal Paragraph 1 */}
            <div style={{ textAlign: 'justify', fontSize: '9pt', marginBottom: '15px', lineHeight: '1.2' }}>
                Por este conducto autorizo expresamente a <strong>HRH 2022, SAPI, S.A. de C.V., SOFOM, E.N.R.</strong>, para que por conducto de sus funcionarios facultados lleve a cabo investigaciones, sobre mi comportamiento crediticio en Círculo de Crédito, S.A. de CV SIC. o Trans Unión de México, S.A. Sociedad de Información Crediticia.
            </div>

            {/* 4. Legal Paragraph 2 */}
            <div style={{ textAlign: 'justify', fontSize: '9pt', marginBottom: '20px', lineHeight: '1.2' }}>
                Asimismo, declaro que conozco y entiendo la naturaleza y alcance de las sociedades de información crediticia, así como la información contenida en los reportes de crédito y en el reporte especial. Declaro que conozco la información que será solicitada y el uso que de la misma hará HRH 2022, SAPI, S.A. de C.V., SOFOM, E.N.R., incluyendo la facultad de realizar consultas periódicas sobre mi historial crediticio ante las sociedades de información crediticia que correspondan. Otorgo mi consentimiento expreso para que la presente autorización tenga una vigencia de tres años contados a partir de su expedición y, en todo caso, mientras se mantenga vigente la relación jurídica.
            </div>

            {/* 5. Solicitant Info */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '9pt', marginBottom: '5px' }}>Nombre del solicitante (Persona física)</div>
                <div style={{ borderBottom: '1px solid #000', height: '20px', marginBottom: '10px' }}></div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '5px', fontSize: '9pt' }}>
                    {['RFC O CURP:', 'DOMICILIO:', 'COLONIA:', 'MUNICIPIO:', 'ESTADO:', 'CÓDIGO POSTAL:', 'TELÉFONO:'].map(label => (
                        <div key={label} style={{ display: 'flex' }}>
                            <span style={{ minWidth: '110px' }}>{label}</span>
                            <span style={{ flex: 1, borderBottom: '0.5px solid #ccc' }}></span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 6. Place and Date */}
            <div style={{ fontSize: '9pt', marginBottom: '10px' }}>
                Lugar y fecha en que se firma la autorización: <span style={{ borderBottom: '1px solid #000', minWidth: '150px', display: 'inline-block' }}></span> DE ENERO DE 2026.
            </div>

            {/* 7. Officer */}
            <div style={{ fontSize: '9pt', marginBottom: '20px' }}>
                Nombre del funcionario que recaba la autorización: <strong>JAIME ROSAS</strong>
            </div>

            {/* 8. Final Legal Note (Bold) */}
            <div style={{ textAlign: 'justify', fontSize: '8.5pt', fontWeight: 'bold', marginBottom: '30px', lineHeight: '1.1' }}>
                Estoy consciente y acepto que este documento quede bajo custodia de HRH 2022, SAPI, S.A. de C.V., SOFOM, E.N.R., y/o Sociedad de información crediticia consultada para efectos de control y cumplimiento del artículo 28 de la ley para Regular las Sociedades de Información Crediticia; mismo que señala que las Sociedades solo podrán proporcionar información a un Usuario, cuando este cuente con la autorización expresa del cliente mediante su firma autógrafa.
            </div>

            {/* 9. Signature Area */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div style={{ width: '250px', borderBottom: '1px solid #000', margin: '0 auto 5px auto' }}></div>
                <div style={{ fontSize: '8.5pt' }}>Nombre, Apellido Paterno y Apellido Materno y Firma</div>
            </div>

            {/* 10. Footer Box */}
            <div style={{
                border: '1px solid #000',
                padding: '10px',
                fontSize: '8.5pt'
            }}>
                <div style={{ fontWeight: 'bold' }}>Para uso exclusivo de la Empresa que efectúa la consulta HRH 2022, SAPI, S.A. de C.V.,</div>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>SOFOM, E.N.R.</div>
                <div>Fecha de Consulta BC: _________________________</div>
                <div style={{ marginTop: '5px' }}>Folio de Consulta BC: _________________________</div>
            </div>




            {/* Admin Footer Box */}
            <div style={{
                border: '1.5px solid #000',
                padding: '10px',
                marginTop: '40px',
                fontSize: '10pt'
            }}>
                <strong>Para uso exclusivo de la Empresa que efectúa la consulta HRH 2022, SAPI, S.A. de C.V., SOFOM, E.N.R.</strong>
                <div style={{ marginTop: '5px' }}>Fecha de Consulta BC: _________________________________</div>
                <div style={{ marginTop: '5px' }}>Folio de Consulta BC: __________________________________</div>
            </div>
        </div>
    );
};
