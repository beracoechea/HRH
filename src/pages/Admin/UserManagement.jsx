import React, { useState, useCallback } from 'react';
// Firebase
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config'; 

// Componentes de Admin
import { UserCard } from '../../components/Admin/UserCard';
import { PendingCitasList } from '../../components/Admin/PendingCitasList';
import { PendingCreditosList } from '../../components/Admin/PendingCreditosList';
import { AdminStats } from '../../components/Admin/AdminStats'; 
import { DocumentTracking } from '../../components/Admin/DocumentTracking';
import { RejectCreditSidebar } from '../../components/Common/RejectCreditSidebar'; // IMPORTACIÓN NUEVA

// Modales y Common
import { StatusModal } from '../../components/Common/StatusModal'; 

import { 
  FiUsers, FiSearch, FiCheckSquare, 
  FiLoader, FiDollarSign, FiPieChart, FiFileText 
} from 'react-icons/fi';

import { useUserManager } from '../hooks/useUserManager';
import { useDocumentTracking } from '../hooks/useDocumentTracking';
import { useAuth } from '../../context/AuthContext';

import '../../assets/styles/UserManagement.css';

const ROLE_PERMISSIONS = {
  admin: { views: ['usuarios', 'pendientes', 'creditos', 'documentos', 'stats'] },
  aprobador: { views: ['pendientes', 'creditos', 'documentos'] },
  tesorero: { views: ['creditos'] },
  marketing: { views: ['stats'] },
  cliente: { views: [] }
};

export const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const permissions = ROLE_PERMISSIONS[currentUser?.rol] || ROLE_PERMISSIONS.cliente;

  // --- ESTADOS ---
  const [view, setView] = useState(permissions.views[0] || '');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para la barra lateral de rechazo
  const [rejectSidebar, setRejectSidebar] = useState({ open: false, id: null });
  
  const [statusConfig, setStatusConfig] = useState({ 
    isOpen: false, 
    type: 'success', 
    message: '' 
  });

  const { 
    users, 
    pendingCitas, 
    creditos, 
    loading: loadingUsers, 
    refreshData, 
    ingresosReales = 0,
  } = useUserManager();

  const { creditosDocs, loading: loadingDocs } = useDocumentTracking();

  // --- HELPERS ---
  const canSee = useCallback((viewName) => permissions.views.includes(viewName), [permissions]);
  
  const showAlert = useCallback((message, type = 'success') => {
    setStatusConfig({ isOpen: true, message, type });
  }, []);

  // --- HANDLERS ---

  const handleCreditAction = useCallback(async (id, status) => {
    if (status === 'rechazado') {
      // Abrimos la barra lateral de rechazo
      setRejectSidebar({ open: true, id: id });
    } else {
      try {
        const docRef = doc(db, "creditos", id);
        await updateDoc(docRef, { 
          estado: status,
          ultimaActualizacion: serverTimestamp() 
        });
        await refreshData();
        showAlert(`Crédito marcado como ${status} exitosamente.`, 'success');
      } catch (error) {
        console.error("Error al aprobar crédito:", error);
        showAlert('Error al actualizar el crédito.', 'error');
      }
    }
  }, [refreshData, showAlert]);

  const handleFinalRejection = async () => {
    const targetId = rejectSidebar.id;
    if (!targetId) return;

    try {
      const docRef = doc(db, "creditos", targetId);
      await updateDoc(docRef, { 
        estado: 'rechazado',
        ultimaActualizacion: serverTimestamp()
      });
      
      setRejectSidebar({ open: false, id: null });
      await refreshData();
      showAlert('Solicitud rechazada correctamente.', 'success');
    } catch (error) {
      console.error("Error en el proceso de rechazo:", error);
      showAlert('Error al procesar el rechazo.', 'error');
    }
  };

  // --- LÓGICA DE CONTADORES Y FILTROS ---
  const docsPendientesCount = creditosDocs?.filter(cre => 
    cre.expediente?.some(doc => doc.estatus?.toLowerCase().trim() === 'pendiente')
  ).length || 0;

  const filteredUsers = users?.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const loading = loadingUsers || loadingDocs;

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="header-title">
          <h1>
            {view === 'usuarios' && <><FiUsers /> Gestión de Usuarios</>}
            {view === 'pendientes' && <><FiCheckSquare /> Citas por Aprobar</>}
            {view === 'creditos' && <><FiDollarSign /> {currentUser?.rol === 'tesorero' ? 'Cobranza y Pagos' : 'Gestión de Créditos'}</>}
            {view === 'stats' && <><FiPieChart /> Estadísticas Generales</>}
            {view === 'documentos' && <><FiFileText /> Seguimiento de Documentos</>}
            {loading && <FiLoader className="spinner" />}
          </h1>
        </div>
        
        <div className="admin-nav-tabs">
  {canSee('usuarios') && (
    <button className={`nav-tab ${view === 'usuarios' ? 'active' : ''}`} onClick={() => setView('usuarios')}>
      <FiUsers /> Usuarios
    </button>
  )}
  
  {canSee('pendientes') && (
    <button className={`nav-tab ${view === 'pendientes' ? 'active' : ''}`} onClick={() => setView('pendientes')}>
      <FiCheckSquare /> Citas
      {pendingCitas?.length > 0 && (
        <span className="tab-badge">{pendingCitas.length}</span>
      )}
    </button>
  )}

  {canSee('creditos') && (
    <button className={`nav-tab ${view === 'creditos' ? 'active' : ''}`} onClick={() => setView('creditos')}>
      <FiDollarSign /> Créditos
      {/* Badge rojo para créditos que necesitan aprobación urgente */}
      {creditos?.filter(c => c.estado === 'pendiente').length > 0 && (
        <span className="tab-badge danger">
          {creditos.filter(c => c.estado === 'pendiente').length}
        </span>
      )}
    </button>
  )}

  {canSee('documentos') && (
    <button className={`nav-tab ${view === 'documentos' ? 'active' : ''}`} onClick={() => setView('documentos')}>
      <FiFileText /> Documentos
      {/* Badge naranja para documentos pendientes de validar */}
      {docsPendientesCount > 0 && (
        <span className="tab-badge warning">{docsPendientesCount}</span>
      )}
    </button>
  )}

  {canSee('stats') && (
    <button className={`nav-tab ${view === 'stats' ? 'active' : ''}`} onClick={() => setView('stats')}>
      <FiPieChart /> Estadísticas
    </button>
  )}
</div>
      </header>

      <div className="admin-content">
        {view === 'usuarios' && canSee('usuarios') && (
          <section className="all-users-section animate-fade">
            <div className="users-list">
              {filteredUsers.map(u => (
                <UserCard 
                  key={u.id} 
                  user={u} 
                  onUpdateRole={currentUser.rol === 'admin' ? refreshData : null} 
                />
              ))}
            </div>
          </section>
        )}

        {view === 'pendientes' && canSee('pendientes') && (
          <PendingCitasList citas={pendingCitas} onActionComplete={refreshData} />
        )}

        {view === 'creditos' && canSee('creditos') && (
          <PendingCreditosList 
            creditos={creditos} 
            onlyPayments={currentUser?.rol === 'tesorero'}
            onAction={handleCreditAction}
            onUpdateSuccess={refreshData}
          />
        )}

        {view === 'documentos' && canSee('documentos') && (
          <DocumentTracking />
        )}

        {view === 'stats' && canSee('stats') && (
          <AdminStats 
            creditos={creditos} 
            usuarios={users} 
            citas={pendingCitas} 
            ingresosReales={ingresosReales} 
          />
        )}

        {/* --- NUEVA BARRA LATERAL DE RECHAZO --- */}
        <RejectCreditSidebar 
          isOpen={rejectSidebar.open}
          creditId={rejectSidebar.id}
          onConfirm={handleFinalRejection}
          onCancel={() => setRejectSidebar({ open: false, id: null })}
        />

        <StatusModal 
          isOpen={statusConfig.isOpen}
          type={statusConfig.type}
          message={statusConfig.message}
          onClose={() => setStatusConfig(prev => ({ ...prev, isOpen: false }))}
        />
      </div>
    </div>
  );
};