import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiCheck, FiX, FiTrendingUp, FiEdit, 
    FiClock, FiCheckCircle, FiAlertTriangle 
} from 'react-icons/fi';
// Eliminamos la importación del hook que causaba el error 404
import { formatMoney } from '../../utils/creditCalculations';

export const CreditRow = ({ cre, onAction, onManagePayments }) => {
    const navigate = useNavigate();
    
    // --- LÓGICA DE CÁLCULO INTEGRADA (Reemplaza al hook) ---
    const calculos = useMemo(() => {
        const pagado = cre.pagado || 0;
        const total = cre.total_estimado || 0;
        const cuota = cre.montoAbono || 1; // Evitar división por cero

        // Calcular progreso basado en monto monetario real
        const porcentaje = total > 0 ? Math.round((pagado / total) * 100) : 0;
        
        // Estimar quincenas liquidadas basadas en el monto pagado
        const qLiquidadas = Math.floor(pagado / cuota);
        const qTotales = cre.plazo_meses ? cre.plazo_meses * 2 : 0;

        return {
            porcentajeProgreso: Math.min(porcentaje, 100),
            quincenasLiquidadas: qLiquidadas,
            quincenasTotales: qTotales
        };
    }, [cre.pagado, cre.total_estimado, cre.montoAbono, cre.plazo_meses]);

    const { porcentajeProgreso, quincenasLiquidadas, quincenasTotales } = calculos;
    const totalConInteres = cre.total_estimado || 0;

    // Validación de documentos
    const docsListos = useMemo(() => {
        if (!cre.expediente || !Array.isArray(cre.expediente)) return false;
        // Solo está listo si hay documentos y TODOS están aprobados o validados
        return cre.expediente.length > 0 && cre.expediente.every(doc => {
            const status = doc?.estatus?.toLowerCase().trim();
            return status === 'aprobado' || status === 'validado';
        });
    }, [cre.expediente]);

    const formatFirebaseDate = (dateField) => {
        if (!dateField) return 'Sin fecha';
        const date = dateField.toDate ? dateField.toDate() : new Date(dateField);
        return date.toLocaleDateString('es-MX', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    };

    return (
        <tr className={`animate-fade ${!docsListos && cre.estado === 'pendiente' ? 'row-warning' : ''}`}>
            <td>
                <div className="admin-user-info">
                    <strong>{cre.usuario_nombre || 'Sin nombre'}</strong>
                    <span className="user-email-text">{cre.usuario_email}</span>
                    <div className="credit-timeline-mini">
                        <FiClock size={10} /> {formatFirebaseDate(cre.createdAt)}
                    </div>
                </div>
            </td>
            
            <td>{formatMoney(cre.monto_solicitado)}</td>
            
            <td>
                <strong className="text-total-interes">
                    {formatMoney(totalConInteres)}
                </strong>
            </td>
            
            <td>
                <div className="admin-payment-info">
                    <span className="payment-tag">
                        Q1: {formatMoney(cre.pago_quincenal_ano1 || cre.pago_quincenal_ano1)}
                    </span>
                    {Number(cre.plazo_meses) > 12 && (
                        <span className="payment-tag second">
                            Q2: {formatMoney(cre.pago_quincenal_ano2)}
                        </span>
                    )}
                </div>
            </td>
            
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
            
            <td>
                <span className={`status-badge ${(cre.estado || 'pendiente').toLowerCase()}`}>
                    {(cre.estado || 'PENDIENTE').toUpperCase()}
                </span>
            </td>
            
            <td>
                <div className="credit-actions">
                    {cre.estado === 'pendiente' ? (
                        <div className="action-approval-container">
                            {!docsListos && (
                                <FiAlertTriangle 
                                    className="alert-blink" 
                                    title="Documentación incompleta o sin validar" 
                                />
                            )}
                            <button 
                                type="button"
                                className="btn-icon-edit" 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    navigate(`/admin/editar-credito/${cre.id}`);
                                }} 
                                title="Editar montos"
                            >
                                <FiEdit />
                            </button>
                            <button 
                                className={`btn-approve-credit ${!docsListos ? 'disabled' : ''}`} 
                                onClick={() => docsListos && onAction(cre.id, 'activo')}
                                disabled={!docsListos}
                            >
                                <FiCheck /> {docsListos ? 'Aprobar' : 'Incompleto'}
                            </button>
                            <button 
                                className="btn-icon-reject" 
                                onClick={() => onAction(cre.id, 'rechazado')}
                                title="Rechazar solicitud"
                            >
                                <FiX />
                            </button>
                        </div>
                    ) : (cre.estado === 'activo' || cre.estado === 'atrasado') ? (
                        <button 
                            type="button"
                            className="btn-manage-credit" 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigate(`/admin/pagos-credito/${cre.id}`);
                            }}
                        >
                            <FiTrendingUp /> Gestionar Pago
                        </button>
                    ) : (
                        <span className="text-muted"><FiCheckCircle /> Finalizado</span>
                    )}
                </div>
            </td>
        </tr>
    );
};