import React, { useMemo } from 'react';
import { FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import '../../assets/styles/PaymentProgressCard.css';

export const PaymentProgressCard = ({ credito }) => {
  const stats = useMemo(() => {
    const total = credito.total_estimado || 0;
    const pagado = credito.pagado || 0;
    const cuota = credito.montoAbono || 1;
    
    const quincenasTotales = (credito.plazo_meses || 0) * 2;
    const quincenasPagadas = Math.floor(pagado / cuota);
    const porcentaje = total > 0 ? Math.min(Math.round((pagado / total) * 100), 100) : 0;

    return {
      porcentaje,
      progresoTexto: `${quincenasPagadas} de ${quincenasTotales} pagos realizados`,
      restante: total - pagado
    };
  }, [credito]);

  return (
    <div className="progress-card-modern">
      <div className="progress-header">
        <h4><FiTrendingUp /> Estatus de Reembolso</h4>
        <span className="badge-count">{stats.progresoTexto}</span>
      </div>
      
      <div className="bar-wrapper">
        <div className="bar-bg">
          <div className="bar-fill" style={{ width: `${stats.porcentaje}%` }}>
             <span className="bar-label">{stats.porcentaje}%</span>
          </div>
        </div>
      </div>

      <div className="progress-footer-stats">
        <div>
          <small>Próximo Pago</small>
          <p>${credito.montoAbono?.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <small>Saldo Pendiente</small>
          <p className="text-warning">${stats.restante.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};