import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentTracking } from '../../pages/hooks/useDocumentTracking';
import { FiEye, FiRefreshCw, FiFileText, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import '../../assets/styles/DocumentTracking.css';

export const DocumentTracking = () => {
  const { creditosDocs, loading } = useDocumentTracking();
  const navigate = useNavigate();
  
  // Filtros: 'revisar' (entregados), 'incompletos' (pendientes enviar), 'finalizados' (revisados)
  const [filtro, setFiltro] = useState('revisar');

  const creditosFiltrados = useMemo(() => {
    if (!creditosDocs || !Array.isArray(creditosDocs)) return [];

    return creditosDocs.filter(cre => {
      if (cre.estado === 'rechazado') return false;

      const totalDocs = cre.expediente?.length || 0;
      const docsEntregados = cre.expediente?.filter(d => !!d.url) || [];
      const docsRevisados = docsEntregados.filter(d => d.estatus === 'aprobado' || d.estatus === 'rechazado');
      
      const tieneDocsPorRevisar = docsEntregados.length > docsRevisados.length;
      const estaIncompleto = docsEntregados.length < totalDocs;
      const estaFinalizado = docsEntregados.length === totalDocs && docsRevisados.length === totalDocs;

      if (filtro === 'revisar') return tieneDocsPorRevisar;
      if (filtro === 'incompletos') return estaIncompleto;
      if (filtro === 'finalizados') return estaFinalizado;
      
      return true;
    });
  }, [creditosDocs, filtro]);

  if (loading) return <div className="loader-container" style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><FiRefreshCw className="spinner" /></div>;

  const counts = {
    revisar: creditosDocs.filter(cre => {
        const ent = cre.expediente?.filter(d => !!d.url) || [];
        const rev = ent.filter(d => d.estatus === 'aprobado' || d.estatus === 'rechazado');
        return ent.length > rev.length;
    }).length,
    incompletos: creditosDocs.filter(cre => (cre.expediente?.filter(d => !!d.url).length || 0) < (cre.expediente?.length || 0)).length,
    finalizados: creditosDocs.filter(cre => {
        const tot = cre.expediente?.length || 0;
        const ent = cre.expediente?.filter(d => !!d.url) || [];
        const rev = ent.filter(d => d.estatus === 'aprobado' || d.estatus === 'rechazado');
        return tot > 0 && ent.length === tot && rev.length === tot;
    }).length
  };

  return (
    <div className="document-tracking-container animate-fade">
      <header className="doc-header">
        <div className="header-title">
          <h3>Gestión de Expedientes</h3>
          <span className="count-badge">{creditosFiltrados.length}</span>
        </div>

        <div className="filter-tabs">
          <button 
            className={`tab-btn ${filtro === 'revisar' ? 'active' : ''}`}
            onClick={() => setFiltro('revisar')}
          >
            <FiEye /> Por Revisar
            <span className="tab-count">{counts.revisar}</span>
          </button>
          <button 
            className={`tab-btn ${filtro === 'incompletos' ? 'active' : ''}`}
            onClick={() => setFiltro('incompletos')}
          >
            <FiAlertCircle /> Incompletos
            <span className="tab-count">{counts.incompletos}</span>
          </button>
          <button 
            className={`tab-btn ${filtro === 'finalizados' ? 'active' : ''}`}
            onClick={() => setFiltro('finalizados')}
          >
            <FiCheckCircle /> Finalizados
            <span className="tab-count">{counts.finalizados}</span>
          </button>
        </div>
      </header>

      <div className="doc-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', padding: '1rem' }}>
        {creditosFiltrados.length > 0 ? (
          creditosFiltrados.map((cre) => (
            <div key={cre.id} className="doc-item-card" style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid var(--primary-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="doc-info" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div className="user-main" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <strong style={{ fontSize: '1.1rem', color: 'var(--dark-bg)' }}>{cre.usuario_nombre || 'Usuario'}</strong>
                   <span className="folio-tag" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', backgroundColor: 'var(--app-bg)', padding: '2px 8px', borderRadius: '4px' }}>#{cre.id.slice(-6).toUpperCase()}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <FiFileText /> {cre.expediente?.filter(d => !!d.url).length} / {cre.expediente?.length} Documentos Entregados
                </div>
              </div>
              <button 
                className="btn-manage" 
                onClick={() => navigate(`/admin/revisar-documentos/${cre.id}`)}
                style={{ marginTop: 'auto', width: '100%', padding: '0.8rem', backgroundColor: 'var(--dark-bg)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600, transition: 'all 0.2s' }}
              >
                <FiEye /> {filtro === 'revisar' ? 'Revisar Ahora' : 'Ver Detalles'}
              </button>
            </div>
          ))
        ) : (
          <div className="empty-state" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            <FiFileText size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>No hay expedientes en esta categoría.</p>
          </div>
        )}
      </div>
    </div>
  );
};