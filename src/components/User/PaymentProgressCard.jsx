import React, { useMemo } from 'react';
import { FiTrendingUp, FiPieChart } from 'react-icons/fi';
// Eliminamos el hook inexistente para evitar el error 404
import '../../assets/styles/PaymentProgressCard.css';

export const PaymentProgressCard = ({ credito }) => {
    
    // Función de formateo local para evitar dependencias externas
    const formatMoney = (val) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(val || 0);
    };

    // Cálculos basados en los campos reales de tu Firebase
    const stats = useMemo(() => {
        const total = credito.total_estimado || 0;
        const pagado = credito.pagado || 0;
        const restante = total - pagado;
        const porcentaje = total > 0 ? Math.min(Math.round((pagado / total) * 100), 100) : 0;

        return {
            totalDeuda: total,
            saldoRestante: restante,
            porcentajeProgreso: porcentaje
        };
    }, [credito.total_estimado, credito.pagado]);

    const { totalDeuda, saldoRestante, porcentajeProgreso } = stats;

    // Solo mostrar si el crédito está activo, aprobado o con atraso
    const estadosVisibles = ['aprobado', 'activo', 'atrasado'];
    if (!estadosVisibles.includes(credito.estado?.toLowerCase())) {
        return null;
    }

    return (
        <div className="payment-progress-card">
            <div className="progress-header">
                <div className="title-group">
                    <FiPieChart className="icon-main" />
                    <h4>Progreso de Pago</h4>
                </div>
                <span className="percentage-badge">{porcentajeProgreso}%</span>
            </div>

            <div className="progress-bar-container">
                <div 
                    className="progress-bar-fill" 
                    style={{ width: `${porcentajeProgreso}%` }}
                ></div>
            </div>

            <div className="progress-stats-grid">
                <div className="stat-item">
                    <span className="stat-label">Total a Pagar</span>
                    <span className="stat-value">{formatMoney(totalDeuda)}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Pagado</span>
                    <span className="stat-value success">{formatMoney(credito.pagado)}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Saldo Pendiente</span>
                    <span className="stat-value warning">{formatMoney(saldoRestante)}</span>
                </div>
            </div>

            <div className="payment-footer">
                <FiTrendingUp /> 
                <span>
                    Próximo abono: <strong>{formatMoney(credito.montoAbono)}</strong>
                </span>
            </div>
        </div>
    );
};