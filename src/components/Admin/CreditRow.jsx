import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiCheck, FiX, FiTrendingUp, FiEdit, 
    FiClock, FiCheckCircle, FiAlertTriangle 
} from 'react-icons/fi';
import { formatMoney } from '../../utils/creditCalculations';
import { StatusPill } from '../Common/StatusPill';

export const CreditRow = ({ cre, onAction }) => {
    const navigate = useNavigate();
    
    // --- LÓGICA DE CÁLCULO INTEGRADA ---
    const calculos = useMemo(() => {
        const pagado = cre.pagado || 0;
        const total = cre.total_estimado || 0;
        const cuota = cre.montoAbono || 1; 

        const porcentaje = total > 0 ? Math.round((pagado / total) * 100) : 0;
        const qLiquidadas = Math.floor(pagado / cuota);
        const qTotales = cre.plazo_meses ? cre.plazo_meses * 2 : 0;

        return {
            porcentajeProgreso: Math.min(porcentaje, 100),
            quincenasLiquidadas: qLiquidadas,
            quincenasTotales: qTotales
        };
    }, [cre.pagado, cre.total_estimado, cre.montoAbono, cre.plazo_meses]);

    const { porcentajeProgreso, quincenasLiquidadas, quincenasTotales } = calculos;

    // Validación de documentos
    const docsListos = useMemo(() => {
        if (!cre.expediente || !Array.isArray(cre.expediente)) return false;
        return cre.expediente.length > 0 && cre.expediente.every(doc => {
            const status = doc?.estatus?.toLowerCase().trim();
            return status === 'aprobado' || status === 'validado';
        });
    }, [cre.expediente]);

    const formatFirebaseDate = (dateField) => {
        if (!dateField) return 'Sin fecha';
        const date = dateField.toDate ? dateField.toDate() : new Date(dateField);
        return date.toLocaleDateString('es-MX', { 
            day: '2-digit', month: '2-digit', year: 'numeric' 
        });
    };

    return (
        <tr className={`animate-fade ${!docsListos && cre.estado === 'pendiente' ? 'row-warning' : ''}`}>
            {/* COLUMNA 1: CLIENTE */}
            <td>
                <div className="admin-user-info">
                    <strong>{cre.usuario_nombre || 'Sin nombre'}</strong>
                    <span className="user-email-text">{cre.usuario_email}</span>
                    <div className="credit-timeline-mini">
                        <FiClock size={10} /> {formatFirebaseDate(cre.createdAt)}
                    </div>
                </div>
            </td>
            
            {/* COLUMNA 2: MONTO SOLICITADO */}
            <td>{formatMoney(cre.monto_solicitado)}</td>
            
            {/* COLUMNA 3: TOTAL ESTIMADO */}
            <td>
                <strong className="text-total-interes">
                    {formatMoney(cre.total_estimado || 0)}
                </strong>
            </td>
            
            {/* COLUMNA 4: ABONOS */}
            <td>
                <div className="admin-payment-info">
                    <span className="payment-tag">
                        Q1: {formatMoney(cre.pago_quincenal_ano1)}
                    </span>
                    {Number(cre.plazo_meses) > 12 && (
                        <span className="payment-tag second">
                            Q2: {formatMoney(cre.pago_quincenal_ano2)}
                        </span>
                    )}
                </div>
            </td>
            
            {/* COLUMNA 5: PROGRESO */}
            <td>
                <div className="credit-progress-detailed">
                    <div className="progress-meta">
                        <span>{quincenasLiquidadas} / {quincenasTotales} Qs</span>
                        <span className="perc-label">{porcentajeProgreso}%</span>
                    </div>
                    <div className="progress-track-container">
                        <div className="progress-track-bg">
                            <div 
                                className={`progress-track-fill ${porcentajeProgreso >= 100 ? 'completed' : ''}`} 
                                style={{ width: `${porcentajeProgreso}%` }}
                            ></div>
                        </div>
                    </div>
                    <small className="pagado-summary">
                        <strong>Pagado:</strong> {formatMoney(cre.pagado || 0)}
                    </small>
                </div>
            </td>
            
            {/* COLUMNA 6: ESTADO (Aquí estaba el error de <td> y de función) */}
            <td>
                <StatusPill status={cre.estado} />
            </td>
            
            {/* COLUMNA 7: ACCIONES */}
            <td>
                <div className="credit-actions">
                    {cre.estado === 'pendiente' ? (
                        <div className="action-approval-container">
                            {!docsListos && (
                                <FiAlertTriangle 
                                    className="alert-blink" 
                                    title="Documentación incompleta" 
                                />
                            )}
                            <button 
                                type="button"
                                className="btn-icon-manage" 
                                onClick={() => onAction(cre.id)} 
                                title="Gestionar Crédito"
                            >
                                <FiEdit />
                            </button>
                            {/* Eliminamos el botón de aprobación directa para forzar revisión en el modal */}
                        </div>
                    ) : (cre.estado === 'activo' || cre.estado === 'atrasado') ? (
                        <button 
                            type="button"
                            className="btn-manage-credit" 
                            onClick={() => onAction(cre.id)}
                        >
                            <FiTrendingUp /> Gestionar
                        </button>
                    ) : (
                        <button 
                            type="button"
                            className="btn-icon-view" 
                            onClick={() => onAction(cre.id)}
                        >
                            <FiCheckCircle /> Ver Detalle
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};