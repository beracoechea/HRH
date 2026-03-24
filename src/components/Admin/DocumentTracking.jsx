import React, { useMemo, useState } from 'react';
import { useDocumentTracking } from '../../pages/hooks/useDocumentTracking';
import { ManageDocModal } from '../Modals/ManageDocModal'; 
import { FiEye, FiRefreshCw, FiFilter } from 'react-icons/fi';
import '../../assets/styles/DocumentTracking.css';

export const DocumentTracking = () => {
  const { creditosDocs, loading, updateMultipleDocs } = useDocumentTracking();
  const [selectedCredit, setSelectedCredit] = useState(null);
  
  // 1. Estado para el filtro: 'pendientes' o 'activos'
  const [filtro, setFiltro] = useState('pendientes');

  // 2. Lógica de filtrado dinámico
  const creditosFiltrados = useMemo(() => {
    if (!creditosDocs || !Array.isArray(creditosDocs)) return [];

    return creditosDocs.filter(cre => {
      // Excluir rechazados siempre
      if (cre.estado === 'rechazado') return false;

      const tieneDocsPendientes = cre?.expediente && Array.isArray(cre.expediente) && 
        cre.expediente.some(doc => {
          const s = doc?.estatus?.toLowerCase().trim();
          return s === 'pendiente' || s === 'esperando';
        });

      if (filtro === 'pendientes') {
        // Solo créditos con documentos que requieren atención
        return tieneDocsPendientes;
      } else {
        // Créditos activos (aprobados o en proceso) que NO tienen docs pendientes
        return cre.estado === 'aprobado' || !tieneDocsPendientes;
      }
    });
  }, [creditosDocs, filtro]);

  const handleUpdateStatus = async (updates, observaciones) => {
    if (!selectedCredit?.id) return;
    const result = await updateMultipleDocs(selectedCredit.id, updates, observaciones);
    if (result.success) setSelectedCredit(null);
  };

  if (loading) return <div className="loader-container"><FiRefreshCw className="spinner" /></div>;

  return (
    <div className="document-tracking-container animate-fade">
      <header className="doc-header">
        <div className="header-title">
          <h3>Gestión de Expedientes</h3>
          <span className="count-badge">{creditosFiltrados.length}</span>
        </div>

        {/* 3. Selector de Filtros */}
        <div className="filter-tabs">
          <button 
            className={`tab-btn ${filtro === 'pendientes' ? 'active' : ''}`}
            onClick={() => setFiltro('pendientes')}
          >
            Por Completar
          </button>
          <button 
            className={`tab-btn ${filtro === 'activos' ? 'active' : ''}`}
            onClick={() => setFiltro('activos')}
          >
            Completos
          </button>
        </div>
      </header>

      <div className="doc-list">
        {creditosFiltrados.length > 0 ? (
          creditosFiltrados.map((cre) => (
            <div key={cre.id} className="doc-item-card">
              <div className="doc-info">
                <div className="user-main">
                   <strong>{cre.usuario_nombre || 'Usuario'}</strong>
                   {cre.estado === 'aprobado' && <span className="status-pill aprobado">Aprobado</span>}
                </div>
                <span className="folio-tag">ID: {cre.id.slice(-6)}</span>
              </div>
              <button className="btn-manage" onClick={() => setSelectedCredit(cre)}>
                <FiEye /> {filtro === 'pendientes' ? 'Gestionar' : 'Ver Detalles'}
              </button>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No hay créditos en esta categoría.</p>
          </div>
        )}
      </div>

      {selectedCredit && (
        <ManageDocModal 
          isOpen={!!selectedCredit}
          credit={selectedCredit}
          onClose={() => setSelectedCredit(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};