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

  if (loading) return (
    <div className="loader-container">
        <FiRefreshCw className="spinner" />
        <p>Cargando expedientes...</p>
    </div>
  );

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
        <div className="header-left">
          <div className="header-title">
            <h3>Expedientes Digitales</h3>
            <span className="count-badge">{creditosDocs.length} totales</span>
          </div>
          <p className="header-subtitle">Gestión integral de documentación y perfiles KYC</p>
        </div>

        <div className="filter-tabs">
          <button className={`tab-btn ${filtro === 'revisar' ? 'active' : ''}`} onClick={() => setFiltro('revisar')}>
            <FiEye /> Por Revisar <span className="tab-count">{counts.revisar}</span>
          </button>
          <button className={`tab-btn ${filtro === 'incompletos' ? 'active' : ''}`} onClick={() => setFiltro('incompletos')}>
            <FiAlertCircle /> Incompletos <span className="tab-count">{counts.incompletos}</span>
          </button>
          <button className={`tab-btn ${filtro === 'finalizados' ? 'active' : ''}`} onClick={() => setFiltro('finalizados')}>
            <FiCheckCircle /> Finalizados <span className="tab-count">{counts.finalizados}</span>
          </button>
        </div>
      </header>

      <div className="doc-list">
        {creditosFiltrados.length > 0 ? (
          creditosFiltrados.map((cre) => (
            <div key={cre.id} className="doc-item-card">
              <div className="doc-card-header">
                 <div className="user-main">
                    <strong>{cre.usuario_nombre || 'Usuario'}</strong>
                    <span className="folio-tag">#{cre.id.slice(-6).toUpperCase()}</span>
                 </div>
                 <div className={`kyc-status-tag ${cre.statusKYC === 'completado' ? 'done' : 'pending'}`}>
                    {cre.statusKYC === 'completado' ? <><FiCheckCircle /> KYC OK</> : <><FiAlertCircle /> KYC PENDIENTE</>}
                 </div>
              </div>

              <div className="doc-card-body">
                <div className="doc-stat-item">
                    <FiFileText />
                    <span>{cre.expediente?.filter(d => !!d.url).length} / {cre.expediente?.length} Docs. entregados</span>
                </div>
                <div className="doc-stat-item">
                    <FiCheckCircle />
                    <span>{cre.expediente?.filter(d => d.estatus === 'aprobado').length} Aprobados</span>
                </div>
              </div>

              <div className="doc-card-actions">
                <button 
                    className="btn-action view-docs" 
                    onClick={() => navigate(`/admin/revisar-documentos/${cre.id}`)}
                >
                    <FiFileText /> Revisar Docs
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <FiFileText size={48} />
            <p>No se encontraron expedientes en esta categoría.</p>
          </div>
        )}
      </div>
    </div>
  );
};
;
