import React, { useMemo } from 'react';
import { CREDIT_STEPS } from '../../constants/creditSteps';
import { FiClock, FiUsers, FiTrendingUp, FiX, FiInfo } from 'react-icons/fi';
import { formatDuration } from '../../utils/timeFormat';
import '../../assets/styles/ProcessTimeline.css';

export const ProcessTimeline = ({ creditos = [], isOpen, onClose }) => {
  
  // 1. Distribución de créditos por fase
  const distribution = useMemo(() => {
    const counts = {};
    CREDIT_STEPS.forEach(step => counts[step.id] = 0);
    
    creditos.forEach(c => {
      const fase = c.fase || 1;
      if (counts[fase] !== undefined) counts[fase]++;
    });
    
    return counts;
  }, [creditos]);

  // 2. Cálculo de tiempos REALES promedio entre fases
  const realAverages = useMemo(() => {
    const intervals = {}; // { '1-2': [durations], '2-3': [durations], ... }
    
    creditos.forEach(c => {
      const history = c.historialPasos || [];
      if (history.length < 2) return;

      // Ordenamos por fase para asegurar secuencia
      const sorted = [...history].sort((a, b) => a.fase - b.fase);

      for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i];
        const next = sorted[i + 1];
        
        if (next.fase === current.fase + 1) {
          const key = `${current.fase}-${next.fase}`;
          const diff = (next.timestamp.toDate ? next.timestamp.toDate() : new Date(next.timestamp)) - 
                       (current.timestamp.toDate ? current.timestamp.toDate() : new Date(current.timestamp));
          
          if (!intervals[key]) intervals[key] = [];
          intervals[key].push(diff);
        }
      }
    });

    // Calcular promedios
    const averages = {};
    Object.keys(intervals).forEach(key => {
      const sum = intervals[key].reduce((a, b) => a + b, 0);
      averages[key] = sum / intervals[key].length;
    });

    return averages;
  }, [creditos]);

  const totalCredits = creditos.length;

  if (!isOpen) return null;

  return (
    <aside className="process-sidebar-overlay" onClick={onClose}>
      <div className="process-sidebar-content animate-slide-in" onClick={e => e.stopPropagation()}>
        <header className="sidebar-header">
            <div className="header-text">
                <h3>Línea de Tiempo Operativa</h3>
                <p>Métricas reales de procesamiento</p>
            </div>
            <button className="btn-close-sidebar" onClick={onClose}><FiX /></button>
        </header>

        <div className="sidebar-stats">
            <div className="mini-stat">
                <FiTrendingUp />
                <span>{totalCredits} Solicitudes en curso</span>
            </div>
        </div>

        <div className="vertical-timeline-wrapper">
            {CREDIT_STEPS.map((step, index) => {
              const avgTime = realAverages[`${step.id}-${step.id + 1}`];

              return (
                <React.Fragment key={step.id}>
                  <div className="timeline-node sidebar-mode">
                    <div className={`node-icon-wrapper ${distribution[step.id] > 0 ? 'active' : ''}`}>
                      {step.icon}
                      <div className="node-number">{step.id}</div>
                    </div>
                    
                    <div className="node-content">
                      <div className="node-main-info">
                          <h4>{step.label}</h4>
                          <div className="metric-badge mini">
                              <FiUsers /> {distribution[step.id]} créditos
                          </div>
                      </div>
                    </div>
                  </div>

                  {/* Intervalo entre pasos (Tiempos REALES) */}
                  {index < CREDIT_STEPS.length - 1 && (
                    <div className="timeline-interval sidebar-mode">
                      <div className="interval-line"></div>
                      <div className="interval-tag real">
                          <FiClock /> 
                          <span>{avgTime ? formatDuration(avgTime) : 'Sin datos'}</span>
                          <small>Promedio Real</small>
                      </div>
                      <div className="interval-line"></div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
        </div>

        <div className="sidebar-footer-info">
            <FiInfo />
            <p>Los tiempos se calculan basándose en la última transición de fase registrada para cada crédito.</p>
        </div>
      </div>
    </aside>
  );
};
