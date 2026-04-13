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
import { RejectCreditSidebar } from '../../components/Common/RejectCreditSidebar'; 
import { UserDetailsModal } from '../../components/Admin/UserDetailsModal';
import { ProcessTimeline } from '../../components/Admin/ProcessTimeline';

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

import { ROLE_PERMISSIONS } from '../../helpers/permissions';

export const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const permissions = ROLE_PERMISSIONS[currentUser?.rol] || ROLE_PERMISSIONS.cliente;

  // --- ESTADOS ---
  const [view, setView] = useState('');
  
  // Efecto para inicializar la vista permitida solo si no hay una vista seleccionada
  React.useEffect(() => {
    if (!view && permissions?.views?.length > 0) {
      if (permissions.views.includes('usuarios')) {
        setView('usuarios');
      } else {
        setView(permissions.views[0]);
      }
    }
  }, [permissions, view]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('todos');
  
  // Estado para la barra lateral de rechazo
  const [rejectSidebar, setRejectSidebar] = useState({ open: false, id: null });
  
  const [statusConfig, setStatusConfig] = useState({ 
    isOpen: false, 
    type: 'success', 
    message: '' 
  });

  // Estado para el detalle de usuario (Sidebar)
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSidebarOpen, setUserSidebarOpen] = useState(false);

  const { 
    users, 
    pendingCitas, 
    creditos, 
    loading: loadingUsers, 
    refreshData, 
    ingresosReales = 0,
  } = useUserManager(currentUser);

  const { creditosDocs, loading: loadingDocs } = useDocumentTracking(currentUser);

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

  const handleUserClick = useCallback((user) => {
    setSelectedUser(user);
    setUserSidebarOpen(true);
  }, []);

  // --- LÓGICA DE CONTADORES Y FILTROS ---
  const docsPendientesCount = creditosDocs?.filter(cre => 
    cre.expediente?.some(doc => doc.estatus?.toLowerCase().trim() === 'pendiente')
  ).length || 0;

  const filteredUsers = users?.filter(u => {
    const matchesSearch = u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.rfc?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'todos' || u.rol === roleFilter;

    // Filtro por grupo para RRHH
    if (permissions.mustFilterByGroup && currentUser?.grupo) {
        return matchesSearch && matchesRole && u.grupo === currentUser.grupo;
    }
    return matchesSearch && matchesRole;
  }) || [];

  const solicitudesCreditos = creditos?.filter(c => {
    const isPending = c.estado === 'pendiente';
    if (permissions.mustFilterByGroup && currentUser?.grupo) {
        return isPending && (c.usuario_grupo === currentUser.grupo || c.grupo === currentUser.grupo);
    }
    return isPending;
  }) || [];

  const activosCreditos = creditos?.filter(c => {
    const isActive = c.estado === 'activo' || c.estado === 'atrasado';
    if (permissions.mustFilterByGroup && currentUser?.grupo) {
        return isActive && (c.usuario_grupo === currentUser.grupo || c.grupo === currentUser.grupo);
    }
    return isActive;
  }) || [];

  const loading = loadingUsers || loadingDocs;

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="header-title">
          <h1>
            {view === 'usuarios' && <><FiUsers /> Usuarios y Roles</>}
            {view === 'pendientes' && <><FiCheckSquare /> Gestión de Citas</>}
            {view === 'solicitudes' && <><FiDollarSign /> Solicitudes por Aprobar</>}
            {view === 'activos' && <><FiDollarSign /> Créditos Activos</>}
            {view === 'expedientes' && <><FiFileText /> Expedientes Digitales</>}
            {view === 'stats' && <><FiPieChart /> Dashboard General</>}
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

  {canSee('solicitudes') && (
    <button className={`nav-tab ${view === 'solicitudes' ? 'active' : ''}`} onClick={() => setView('solicitudes')}>
      <FiDollarSign /> Solicitudes
      {solicitudesCreditos?.length > 0 && (
        <span className="tab-badge danger">{solicitudesCreditos.length}</span>
      )}
    </button>
  )}

  {canSee('activos') && (
    <button className={`nav-tab ${view === 'activos' ? 'active' : ''}`} onClick={() => setView('activos')}>
      <FiDollarSign /> Activos
      {activosCreditos?.length > 0 && (
        <span className="tab-badge">{activosCreditos.length}</span>
      )}
    </button>
  )}

  {canSee('expedientes') && (
    <button className={`nav-tab ${view === 'expedientes' ? 'active' : ''}`} onClick={() => setView('expedientes')}>
      <FiFileText /> Expedientes
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
             <div className="admin-actions-bar">
                <div className="search-bar">
                    <FiSearch />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre, email o RFC..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="role-filter-box">
                    <select 
                        value={roleFilter} 
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="role-select-filter"
                    >
                        <option value="todos">Todos los roles</option>
                        <option value="cliente">Clientes</option>
                        <option value="rh">Recursos Humanos</option>
                        <option value="analista">Analistas</option>
                        <option value="admin">Administradores</option>
                        <option value="tesorero">Tesorería</option>
                    </select>
                </div>
             </div>
            <div className="users-list">
              {filteredUsers.map(u => (
                <UserCard 
                  key={u.id} 
                  user={u} 
                  onUpdateRole={currentUser.rol === 'admin' ? refreshData : null} 
                  onClick={() => handleUserClick(u)}
                />
              ))}
            </div>
          </section>
        )}

        {view === 'pendientes' && canSee('pendientes') && (
          <PendingCitasList citas={pendingCitas} onActionComplete={refreshData} />
        )}

        {view === 'solicitudes' && canSee('solicitudes') && (
          <PendingCreditosList 
            creditos={solicitudesCreditos} 
            fixedStatus="pendiente"
            onAction={handleCreditAction}
            onUpdateSuccess={refreshData}
          />
        )}

        {view === 'activos' && canSee('activos') && (
          <PendingCreditosList 
            creditos={activosCreditos} 
            fixedStatus="activo"
            onlyPayments={currentUser?.rol === 'tesorero'}
            onAction={handleCreditAction}
            onUpdateSuccess={refreshData}
          />
        )}

        {view === 'expedientes' && canSee('expedientes') && (
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

        <UserDetailsModal 
          isOpen={userSidebarOpen}
          user={selectedUser}
          creditos={creditos}
          citas={pendingCitas} 
          onClose={() => setUserSidebarOpen(false)}
          onUpdateRole={refreshData}
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