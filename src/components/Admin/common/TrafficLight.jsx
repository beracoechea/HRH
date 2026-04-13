import React from 'react';

/**
 * Semáforo de riesgo IA (Vertex AI)
 * @param {number} score - Puntaje de 0-100
 * @param {string} semaforo - VERDE, AMARILLO, ROJO
 */
export const TrafficLight = ({ score, semaforo }) => {
  const config = {
    VERDE: { color: '#10b981', bg: '#ecfdf5', label: 'BAJO RIESGO' },
    AMARILLO: { color: '#f59e0b', bg: '#fffbeb', label: 'REVISIÓN' },
    ROJO: { color: '#ef4444', bg: '#fef2f2', label: 'ALTO RIESGO' }
  };
  const active = config[semaforo] || { color: '#64748b', bg: '#f1f5f9', label: 'SIN ANALIZAR' };

  return (
    <div className="ai-badge-container" style={{ 
        background: active.bg, 
        border: `1px solid ${active.color}`, 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        padding: '6px 15px', 
        borderRadius: '40px' 
    }}>
      <div className="score-circle" style={{ 
          border: `2px solid ${active.color}`, 
          color: active.color, 
          borderRadius: '50%', 
          width: '32px', 
          height: '32px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontWeight: 'bold', 
          fontSize: '0.85rem' 
      }}>
          {score || '0'}
      </div>
      <span style={{ 
          color: active.color, 
          fontWeight: '800', 
          fontSize: '0.7rem', 
          letterSpacing: '0.5px' 
      }}>{active.label}</span>
    </div>
  );
};
