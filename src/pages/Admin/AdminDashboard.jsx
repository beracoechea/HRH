import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_PERMISSIONS } from '../../helpers/permissions';
import { useUserManager } from '../hooks/useUserManager';
import { useDocumentTracking } from '../hooks/useDocumentTracking';

// Iconos
import { 
  FiUsers, FiGrid, FiDollarSign, FiPieChart, 
  FiLoader, FiSearch, FiFilter, FiLayers
} from 'react-icons/fi';

// Componentes
import { UserCard } from '../../components/Admin/UserCard';
import { AdminStats } from '../../components/Admin/AdminStats';
import { PendingCreditosList } from '../../components/Admin/PendingCreditosList';
import { UserDetailsModal } from '../../components/Admin/UserDetailsModal';
import { StatusModal } from '../../components/Common/StatusModal';
import { CreditManagementModal } from '../../components/Admin/CreditManagementModal';
import { GroupManager } from '../../components/Admin/GroupManager';

// Estilos
import '../../assets/styles/UserManagement.css';

export const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const permissions = ROLE_PERMISSIONS[currentUser?.rol] || ROLE_PERMISSIONS.cliente;
  const isHRH = currentUser?.grupo?.toUpperCase() === 'HRH';

  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('todos');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedCreditId, setSelectedCreditId] = useState(null);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  
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
  } = useUserManager(currentUser);

  const { creditosDocs, loading: loadingDocs } = useDocumentTracking(currentUser);

  // Inicializar pestaña permitida
  useEffect(() => {
    if (!activeTab && permissions?.views?.length > 0) {
      if (permissions.views.includes('usuarios')) setActiveTab('usuarios');
      else if (permissions.views.includes('mesa')) setActiveTab('mesa');
      else setActiveTab(permissions.views[0]);
    }
  }, [permissions, activeTab]);

  // --- HELPERS ---
  const canSee = useCallback((viewName) => permissions.views.includes(viewName), [permissions]);
  
  const showAlert = (message, type = 'success') => {
    setStatusConfig({ isOpen: true, message, type });
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  const handleCreditClick = (creditId) => {
    setSelectedCreditId(creditId);
    setCreditModalOpen(true);
  };

  // --- FILTROS ---
  const filteredUsers = users?.filter(u => {
    const matchesSearch = u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.rfc?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'todos' || u.rol === roleFilter;
    if (permissions.mustFilterByGroup && currentUser?.grupo) {
        return matchesSearch && matchesRole && u.grupo === currentUser.grupo;
    }
    return matchesSearch && matchesRole;
  }) || [];

  const loading = loadingUsers || loadingDocs;

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="header-title">
          <h1>
            {activeTab === 'usuarios' && <><FiUsers /> Gestión de Usuarios</>}
            {activeTab === 'mesa' && <><FiGrid /> Mesa de Control</>}
            {activeTab === 'tesoreria' && <><FiDollarSign /> Tesorería y Pagos</>}
            {activeTab === 'stats' && <><FiPieChart /> Análisis y Estadísticas</>}
            {activeTab === 'grupos' && <><FiLayers /> Gestión de Grupos</>}
            {loading && <FiLoader className="spinner" />}
          </h1>
        </div>
        
        <div className="admin-nav-tabs">
          {canSee('usuarios') && (
            <button className={`nav-tab ${activeTab === 'usuarios' ? 'active' : ''}`} onClick={() => setActiveTab('usuarios')}>
              <FiUsers /> Usuarios
            </button>
          )}
          {canSee('mesa') && (
            <button className={`nav-tab ${activeTab === 'mesa' ? 'active' : ''}`} onClick={() => setActiveTab('mesa')}>
              <FiGrid /> Mesa de Control
            </button>
          )}
          {canSee('tesoreria') && (
            <button className={`nav-tab ${activeTab === 'tesoreria' ? 'active' : ''}`} onClick={() => setActiveTab('tesoreria')}>
              <FiDollarSign /> Tesorería
            </button>
          )}
          {canSee('stats') && (
            <button className={`nav-tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
              <FiPieChart /> Estadísticas
            </button>
          )}
          {isHRH && (
            <button className={`nav-tab ${activeTab === 'grupos' ? 'active' : ''}`} onClick={() => setActiveTab('grupos')}>
              <FiLayers /> Grupos
            </button>
          )}
        </div>
      </header>

      <div className="admin-content">
        {activeTab === 'usuarios' && canSee('usuarios') && (
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
                  onUpdateRole={(currentUser.rol === 'admin' || isHRH) ? refreshData : null} 
                  onClick={() => handleUserClick(u)}
                />
              ))}
            </div>
          </section>
        )}

        {activeTab === 'mesa' && canSee('mesa') && (
          <PendingCreditosList 
            creditos={creditos} 
            onAction={handleCreditClick} // Ahora abre el modal
            onUpdateSuccess={refreshData}
          />
        )}

        {activeTab === 'tesoreria' && canSee('tesoreria') && (
          <PendingCreditosList 
            creditos={creditos.filter(c => c.estado === 'activo' || c.estado === 'atrasado')} 
            fixedStatus="activo"
            onlyPayments={true}
            onAction={handleCreditClick}
            onUpdateSuccess={refreshData}
          />
        )}

        {activeTab === 'stats' && canSee('stats') && (
          <AdminStats 
            creditos={creditos} 
            usuarios={users} 
            citas={pendingCitas} 
            ingresosReales={ingresosReales} 
          />
        )}

        {activeTab === 'grupos' && isHRH && (
          <GroupManager currentUser={currentUser} />
        )}
      </div>

      {/* --- MODALES --- */}
      <CreditManagementModal 
        isOpen={creditModalOpen}
        creditId={selectedCreditId}
        onClose={() => setCreditModalOpen(false)}
        onUpdate={refreshData}
      />

      <UserDetailsModal 
        isOpen={userModalOpen}
        user={selectedUser}
        creditos={creditos}
        citas={pendingCitas} 
        onClose={() => setUserModalOpen(false)}
        onUpdateRole={refreshData}
      />

      <StatusModal 
        isOpen={statusConfig.isOpen}
        type={statusConfig.type}
        message={statusConfig.message}
        onClose={() => setStatusConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
