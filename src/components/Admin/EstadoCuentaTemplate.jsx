import React from 'react';
import '../../assets/styles/EstadoCuenta.css';
import LogoPrincipal from '../../assets/images/LogoPrincipal.png';
import { formatMoney } from '../../utils/creditCalculations';

export const EstadoCuentaTemplate = ({ 
    id = "estado-cuenta-pdf", 
    data, 
    onChange 
}) => {
    // Utility for inputs
    const handleInp = (field, e) => {
        if (onChange) onChange(field, e.target.value);
    };

    const handleRowInp = (idx, field, e) => {
        if (onChange) onChange('tabla', { idx, field, value: e.target.value });
    };

    return (
        <div id={id} className="estado-cuenta-container">
            {/* HEADER */}
            <div className="ec-header">
                <div className="ec-logo-area" style={{ border: 'none', padding: '10px' }}>
                    <img 
                        src={LogoPrincipal} 
                        alt="Logo Principal" 
                        style={{ maxWidth: '100%', maxHeight: '60px', objectFit: 'contain' }} 
                    />
                </div>
                <div className="ec-company-info">
                    <strong>⚠️ Reg. Contrato Adhesión:</strong>
                    <input value={data.regContrato} onChange={(e) => handleInp('regContrato', e)} placeholder="Ingresa el registro aquí..." style={{ fontWeight: 'bold' }} />
                    
                    <strong>RFC:</strong>
                    <input value={data.empresaRfc} onChange={(e) => handleInp('empresaRfc', e)} />
                    
                    <strong>Domicilio:</strong>
                    <textarea value={data.empresaDomicilio} onChange={(e) => handleInp('empresaDomicilio', e)} rows={2} style={{ resize: 'none' }} />
                    
                    <strong>Tel:</strong>
                    <input value={data.empresaTel} onChange={(e) => handleInp('empresaTel', e)} />
                    
                    <strong>Email:</strong>
                    <input value={data.empresaEmail} onChange={(e) => handleInp('empresaEmail', e)} />
                    
                    <strong>Web:</strong>
                    <input value={data.empresaWeb} onChange={(e) => handleInp('empresaWeb', e)} />
                </div>
                <div className="ec-title-area">
                    <h2>ESTADO DE CUENTA</h2>
                    <div style={{ fontSize: '10px' }}>Período:</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', margin: '5px 0' }}>
                        <input value={data.periodo} onChange={(e) => handleInp('periodo', e)} style={{ textAlign: 'center', color: 'white', fontWeight: 'bold' }} />
                    </div>
                    <div style={{ fontSize: '10px' }}>
                        Emisión: <input value={data.emision} onChange={(e) => handleInp('emision', e)} style={{ textAlign: 'center', color: 'white', width: '80px', display: 'inline-block' }} />
                    </div>
                </div>
            </div>

            {/* DATOS DEL ACREDITADO */}
            <div className="ec-section-title">DATOS DEL ACREDITADO</div>
            <div className="ec-grid-2">
                <table className="ec-table">
                    <tbody>
                        <tr>
                            <td className="ec-label-cell">Nombre del Acreditado:</td>
                            <td className="ec-value-cell"><input value={data.nombreAcreditado} onChange={(e) => handleInp('nombreAcreditado', e)} /></td>
                        </tr>
                        <tr>
                            <td className="ec-label-cell">RFC:</td>
                            <td className="ec-value-cell"><input value={data.acreditadoRfc} onChange={(e) => handleInp('acreditadoRfc', e)} /></td>
                        </tr>
                        <tr>
                            <td className="ec-label-cell" style={{ verticalAlign: 'top' }}>Domicilio:</td>
                            <td className="ec-value-cell"><textarea value={data.acreditadoDomicilio} onChange={(e) => handleInp('acreditadoDomicilio', e)} rows={2} style={{ resize: 'none' }} /></td>
                        </tr>
                        <tr>
                            <td className="ec-label-cell" style={{ verticalAlign: 'top' }}>Ciudad / C.P.:</td>
                            <td className="ec-value-cell"><textarea value={data.acreditadoCiudadCP} onChange={(e) => handleInp('acreditadoCiudadCP', e)} rows={2} style={{ resize: 'none' }} /></td>
                        </tr>
                        <tr>
                            <td className="ec-label-cell">Obligado Solidario:</td>
                            <td className="ec-value-cell"><input value={data.obligadoSolidario} onChange={(e) => handleInp('obligadoSolidario', e)} /></td>
                        </tr>
                        <tr>
                            <td className="ec-label-cell">Tipo de Cliente:</td>
                            <td className="ec-value-cell"><input value={data.tipoCliente} onChange={(e) => handleInp('tipoCliente', e)} /></td>
                        </tr>
                    </tbody>
                </table>
                <table className="ec-table">
                    <tbody>
                        <tr>
                            <td className="ec-label-cell">No. de Crédito:</td>
                            <td className="ec-value-cell"><input value={data.noCredito} onChange={(e) => handleInp('noCredito', e)} /></td>
                        </tr>
                        <tr>
                            <td className="ec-label-cell">Tipo de Crédito:</td>
                            <td className="ec-value-cell"><input value={data.tipoCredito} onChange={(e) => handleInp('tipoCredito', e)} /></td>
                        </tr>
                        <tr>
                            <td className="ec-label-cell">Moneda:</td>
                            <td className="ec-value-cell"><input value={data.moneda} onChange={(e) => handleInp('moneda', e)} /></td>
                        </tr>
                        <tr>
                            <td className="ec-label-cell">Fecha de Inicio:</td>
                            <td className="ec-value-cell"><input value={data.fechaInicio} onChange={(e) => handleInp('fechaInicio', e)} /></td>
                        </tr>
                        <tr>
                            <td className="ec-label-cell">Primer Pago:</td>
                            <td className="ec-value-cell"><input value={data.primerPago} onChange={(e) => handleInp('primerPago', e)} /></td>
                        </tr>
                        <tr>
                            <td className="ec-label-cell">Último Pago:</td>
                            <td className="ec-value-cell"><input value={data.ultimoPago} onChange={(e) => handleInp('ultimoPago', e)} /></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* CONDICIONES Y RESUMEN DEL CRÉDITO */}
            <div className="ec-section-title">CONDICIONES Y RESUMEN DEL CRÉDITO</div>
            <div className="ec-grid-2">
                <table className="ec-table">
                    <tbody>
                        <tr>
                            <td className="ec-label-cell">Importe del Crédito:</td>
                            <td className="ec-value-cell"><input value={data.importeCredito} onChange={(e) => handleInp('importeCredito', e)} /></td>
                        </tr>
                        <tr>
                            <td className="ec-label-cell">Comisión de Apertura:</td>
                            <td className="ec-value-cell"><input value={data.comisionApertura} onChange={(e) => handleInp('comisionApertura', e)} /></td>
                        </tr>
                        <tr>
                            <td className="ec-label-cell">Tasa Interés Ordinaria:</td>
                            <td className="ec-value-cell"><input value={data.tasaOrdinaria} onChange={(e) => handleInp('tasaOrdinaria', e)} /></td>
                        </tr>
                        <tr>
                            <td className="ec-label-cell">Tasa Interés Moratoria:</td>
                            <td className="ec-value-cell"><input value={data.tasaMoratoria} onChange={(e) => handleInp('tasaMoratoria', e)} /></td>
                        </tr>
                        <tr>
                            <td className="ec-label-cell">Pagos Realizados:</td>
                            <td className="ec-value-cell"><input value={data.pagosRealizados} onChange={(e) => handleInp('pagosRealizados', e)} /></td>
                        </tr>
                        <tr>
                            <td className="ec-label-cell">Días en Mora:</td>
                            <td className="ec-value-cell"><input value={data.diasMora} onChange={(e) => handleInp('diasMora', e)} /></td>
                        </tr>
                    </tbody>
                </table>
                <table className="ec-table">
                    <tbody>
                        <tr>
                            <td className="ec-label-cell">No. de Pagos:</td>
                            <td className="ec-value-cell"><input value={data.noPagos} onChange={(e) => handleInp('noPagos', e)} /></td>
                        </tr>
                        <tr>
                            <td className="ec-label-cell">Pago Mensual:</td>
                            <td className="ec-value-cell"><input value={data.pagoMensual} onChange={(e) => handleInp('pagoMensual', e)} /></td>
                        </tr>
                        <tr>
                            <td className="ec-label-cell">Pago Últ. Mensualidad:</td>
                            <td className="ec-value-cell"><input value={data.pagoUltMensualidad} onChange={(e) => handleInp('pagoUltMensualidad', e)} /></td>
                        </tr>
                        <tr>
                            <td className="ec-label-cell">Total a Pagar (pagaré):</td>
                            <td className="ec-value-cell"><input value={data.totalPagarPagare} onChange={(e) => handleInp('totalPagarPagare', e)} /></td>
                        </tr>
                        <tr>
                            <td className="ec-label-cell">Pagos Pendientes:</td>
                            <td className="ec-value-cell"><input value={data.pagosPendientes} onChange={(e) => handleInp('pagosPendientes', e)} /></td>
                        </tr>
                        <tr>
                            <td className="ec-label-cell">Estatus:</td>
                            <td className="ec-value-cell" style={{ background: '#dcfce7' }}>
                                <input value={data.estatusGeneral} onChange={(e) => handleInp('estatusGeneral', e)} style={{ color: '#16a34a', fontWeight: 'bold' }} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* ACCESORIOS Y COMISIONES */}
            <div className="ec-section-title">ACCESORIOS Y COMISIONES (conforme tabla de amortización oficial)</div>
            <table className="ec-table ec-table-headers ec-table-rows">
                <thead>
                    <tr>
                        <th>Accesorio</th>
                        <th>Monto</th>
                        <th>IVA</th>
                        <th>Cobro</th>
                        <th>Total</th>
                        <th>Pago Periódico</th>
                        <th>Período</th>
                        <th>Estatus</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Apertura</td>
                        <td><input value={data.accAperturaMonto} onChange={(e) => handleInp('accAperturaMonto', e)} style={{ textAlign: 'center' }} /></td>
                        <td><input value={data.accAperturaIVA} onChange={(e) => handleInp('accAperturaIVA', e)} style={{ textAlign: 'center' }} /></td>
                        <td><input value={data.accAperturaCobro} onChange={(e) => handleInp('accAperturaCobro', e)} style={{ textAlign: 'center' }} /></td>
                        <td><input value={data.accAperturaTotal} onChange={(e) => handleInp('accAperturaTotal', e)} style={{ textAlign: 'center' }} /></td>
                        <td><input value={data.accAperturaPago} onChange={(e) => handleInp('accAperturaPago', e)} style={{ textAlign: 'center' }} /></td>
                        <td><input value={data.accAperturaPeriodo} onChange={(e) => handleInp('accAperturaPeriodo', e)} style={{ textAlign: 'center' }} /></td>
                        <td style={{ background: '#dcfce7', color: '#16a34a', fontWeight: 'bold', textAlign: 'center' }}>
                            <input value={data.accAperturaEstatus} onChange={(e) => handleInp('accAperturaEstatus', e)} style={{ textAlign: 'center', color: 'inherit', fontWeight: 'bold' }} />
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* TABLA DE AMORTIZACIÓN OFICIAL */}
            <div className="ec-section-title">TABLA DE AMORTIZACIÓN OFICIAL — CREDIGO CAPITAL</div>
            <table className="ec-table ec-table-headers ec-table-rows" style={{ fontSize: '9px' }}>
                <thead>
                    <tr>
                        <th style={{ width: '12%' }}>No. Período</th>
                        <th style={{ width: '10%' }}>Fecha de Pago</th>
                        <th style={{ width: '13%' }}>Abono al Principal</th>
                        <th style={{ width: '13%' }}>Pago a Intereses Ordinarios</th>
                        <th style={{ width: '13%' }}>Pago de Comisiones</th>
                        <th style={{ width: '10%' }}>IVA de Intereses</th>
                        <th style={{ width: '14%' }}>Cantidad Total a Pagar</th>
                        <th style={{ width: '15%' }}>Saldo Insoluto</th>
                    </tr>
                </thead>
                <tbody>
                    {data.tabla.map((row, idx) => {
                        // Colores condicionales
                        let rowStyle = {};
                        if (row.tag === 'PAGADO') rowStyle = { background: '#dcfce7', color: '#15803d' };
                        if (row.tag === 'PERÍODO') rowStyle = { background: '#fef08a' };
                        if (row.pagoN === 0) rowStyle = { background: '#fef9c3', color: '#854d0e', fontWeight: 'bold' };
                        
                        return (
                            <tr key={idx} style={rowStyle}>
                                <td>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{row.pagoN}</span>
                                        <input 
                                            value={row.tag || ''} 
                                            onChange={(e) => handleRowInp(idx, 'tag', e)} 
                                            style={{ width: '60px', fontSize: '9px', fontWeight: 'bold', textAlign: 'right', color: row.tag === 'PAGADO' ? '#15803d' : 'inherit' }} 
                                        />
                                    </div>
                                </td>
                                <td><input value={row.fecha} onChange={(e) => handleRowInp(idx, 'fecha', e)} style={{ textAlign: 'center' }} /></td>
                                <td><input value={row.capital} onChange={(e) => handleRowInp(idx, 'capital', e)} style={{ textAlign: 'right' }} /></td>
                                <td><input value={row.interes} onChange={(e) => handleRowInp(idx, 'interes', e)} style={{ textAlign: 'right' }} /></td>
                                <td><input value={row.comisiones} onChange={(e) => handleRowInp(idx, 'comisiones', e)} style={{ textAlign: 'right' }} /></td>
                                <td><input value={row.iva} onChange={(e) => handleRowInp(idx, 'iva', e)} style={{ textAlign: 'right' }} /></td>
                                <td><input value={row.cuota} onChange={(e) => handleRowInp(idx, 'cuota', e)} style={{ textAlign: 'right', fontWeight: 'bold' }} /></td>
                                <td><input value={row.saldo} onChange={(e) => handleRowInp(idx, 'saldo', e)} style={{ textAlign: 'right', fontWeight: 'bold' }} /></td>
                            </tr>
                        );
                    })}
                    {/* Fila Totales */}
                    <tr style={{ background: '#1e3a8a', color: 'white', fontWeight: 'bold' }}>
                        <td colSpan="2" style={{ textAlign: 'center' }}>TOTALES</td>
                        <td style={{ textAlign: 'right' }}>{data.totales.capital}</td>
                        <td style={{ textAlign: 'right' }}>{data.totales.interes}</td>
                        <td style={{ textAlign: 'right' }}>{data.totales.comisiones}</td>
                        <td style={{ textAlign: 'right' }}>{data.totales.iva}</td>
                        <td style={{ textAlign: 'right' }}>{data.totales.cuota}</td>
                        <td style={{ textAlign: 'right' }}>{data.totales.saldo}</td>
                    </tr>
                </tbody>
            </table>

            {/* SALDO AL CORTE */}
            <div className="ec-section-title">SALDO AL CORTE DEL PERÍODO — {data.saldoCorteMes}</div>
            <table className="ec-table ec-table-rows" style={{ fontSize: '10px' }}>
                <tbody>
                    <tr>
                        <td style={{ textAlign: 'left', width: '70%' }}>Capital Original del Crédito</td>
                        <td style={{ textAlign: 'right' }}><input value={data.corteCapitalOrig} onChange={(e) => handleInp('corteCapitalOrig', e)} style={{ textAlign: 'right' }} /></td>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'left' }}>Comisión de Apertura Cobrada (Período 0)</td>
                        <td style={{ textAlign: 'right' }}><input value={data.corteComisionApertura} onChange={(e) => handleInp('corteComisionApertura', e)} style={{ textAlign: 'right' }} /></td>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'left' }}>(-) Total Abonado a Capital</td>
                        <td style={{ textAlign: 'right' }}><input value={data.corteAbonadoCapital} onChange={(e) => handleInp('corteAbonadoCapital', e)} style={{ textAlign: 'right' }} /></td>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'left' }}>(-) Intereses Ordinarios Pagados</td>
                        <td style={{ textAlign: 'right' }}><input value={data.corteInteresesPagados} onChange={(e) => handleInp('corteInteresesPagados', e)} style={{ textAlign: 'right' }} /></td>
                    </tr>
                    <tr style={{ background: '#dbeafe', fontWeight: 'bold' }}>
                        <td style={{ textAlign: 'left', color: '#1e3a8a' }}>SALDO DE CAPITAL VIGENTE (Insoluto)</td>
                        <td style={{ textAlign: 'right', color: '#1e3a8a' }}><input value={data.corteSaldoInsoluto} onChange={(e) => handleInp('corteSaldoInsoluto', e)} style={{ textAlign: 'right', fontWeight: 'bold', color: 'inherit' }} /></td>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'left' }}>Total Entregado al Acreedor</td>
                        <td style={{ textAlign: 'right' }}><input value={data.corteEntregado} onChange={(e) => handleInp('corteEntregado', e)} style={{ textAlign: 'right' }} /></td>
                    </tr>
                    <tr style={{ background: '#fef9c3', fontWeight: 'bold' }}>
                        <td style={{ textAlign: 'left' }}>Próxima Mensualidad</td>
                        <td style={{ textAlign: 'right' }}><input value={data.corteProxMensualidad} onChange={(e) => handleInp('corteProxMensualidad', e)} style={{ textAlign: 'right', fontWeight: 'bold', color: '#854d0e' }} /></td>
                    </tr>
                    <tr style={{ background: '#fef9c3', fontWeight: 'bold' }}>
                        <td style={{ textAlign: 'left' }}>Fecha Próximo Pago</td>
                        <td style={{ textAlign: 'right' }}><input value={data.corteFechaProxPago} onChange={(e) => handleInp('corteFechaProxPago', e)} style={{ textAlign: 'right', fontWeight: 'bold', color: '#854d0e' }} /></td>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'left' }}>Días en Mora</td>
                        <td style={{ textAlign: 'right' }}><input value={data.corteDiasMora} onChange={(e) => handleInp('corteDiasMora', e)} style={{ textAlign: 'right' }} /></td>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'left' }}>Estatus</td>
                        <td style={{ textAlign: 'right', background: '#dcfce7', color: '#15803d', fontWeight: 'bold' }}><input value={data.corteEstatus} onChange={(e) => handleInp('corteEstatus', e)} style={{ textAlign: 'right', fontWeight: 'bold', color: 'inherit' }} /></td>
                    </tr>
                </tbody>
            </table>

            {/* NOTAS LEGALES */}
            <div className="ec-section-title">NOTAS LEGALES — INFORMACIÓN AL USUARIO</div>
            <div className="ec-footer-legal">
                <textarea 
                    value={data.notasLegales} 
                    onChange={(e) => handleInp('notasLegales', e)} 
                    style={{ width: '100%', height: '120px', border: '1px solid transparent', background: 'transparent', resize: 'vertical', fontFamily: 'inherit', fontSize: 'inherit' }} 
                />
            </div>

            <div className="ec-footer-brand">
                <input 
                    value={data.footerBrand} 
                    onChange={(e) => handleInp('footerBrand', e)} 
                    style={{ width: '100%', textAlign: 'center', color: 'white', background: 'transparent', border: 'none' }} 
                />
            </div>
        </div>
    );
};
