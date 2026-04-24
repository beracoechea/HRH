import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { ROLE_PERMISSIONS } from './helpers/permissions';

// Contexto
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout y Componentes Globales
import { Navbar } from './components/Layout/Navbar';
import { ChatBot } from './components/Common/ChatBot';
import { AuthModal } from './components/Modals/AuthModal';
import ScrollToTop from './components/Common/ScrollToTop';


// Pages Públicas
import { Home } from './pages/Dashboard/Home';
import SimulaCredito from './pages/Dashboard/SimulaCredito';
import { AboutUs } from './pages/Dashboard/QuienesSomos';
import SolucionesFinancieras from './pages/Dashboard/SolucionesFinancieras';
import { Formatos } from './pages/Dashboard/Formatos';
import { Noticias } from './pages/Dashboard/Noticias';
import { NotFound } from './pages/NotFound/NotFound';
import { MiPerfil } from './pages/Dashboard/MiPerfil';
import LegalTransparency from './pages/Legal/LegalTransparency';

// Pages Admin 
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { PageConfig } from './pages/Admin/PageConfig';
import { EditCreditPage } from './pages/Admin/EditCreditPage';
import { CreditPaymentPage } from './pages/Admin/CreditPaymentPage';
import { DocumentReviewPage } from './pages/Admin/DocumentReviewPage';
import { DevTools } from './pages/Admin/DevTools';

// --- COMPONENTE DE RUTA PRIVADA (CLIENTES) ---
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null; 
  return isAuthenticated ? children : <Navigate replace to="/" />;
};

// --- COMPONENTE DE RUTA ADMINISTRADOR ---
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  
  // Verificamos si el rol del usuario tiene permiso de entrar al panel
  const hasAccess = ROLE_PERMISSIONS[user?.rol]?.accessAdminPanel;
  
  return isAuthenticated && hasAccess 
    ? children 
    : <Navigate replace to="/" />;
};

// --- CONTENIDO DE LA APP ---
// Separamos el contenido en un sub-componente para poder usar useAuth()
// ya que el Provider debe estar un nivel arriba en el árbol de componentes.
const AppContent = () => {
const { isAuthModalOpen, closeLogin } = useAuth();

  return (
    <div className="app-container">
      {/* Barra de navegación global */}
      <Navbar />

      <main className="main-content">
        <Routes>
          {/* --- Rutas Públicas --- */}
          <Route path="/" element={<Home />} />
          <Route path="/simulacion" element={<SimulaCredito />} />
          <Route path="/quienes-somos" element={<AboutUs />} />
          <Route path="/soluciones-financieras" element={<SolucionesFinancieras />} />
          <Route path="/formatos" element={<Formatos />} />
          <Route path="/condusef" element={<Noticias />} />
          <Route path="/transparencia" element={<LegalTransparency />} />

          {/* --- Rutas Privadas (Clientes) --- */}
          <Route 
            path="/mi-perfil" 
            element={
              <PrivateRoute>
                <MiPerfil />
              </PrivateRoute>
            } 
          />

          {/* --- Rutas de Administración (Solo Admin) --- */}
          <Route 
            path="/admin/users" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />

          <Route 
            path="/admin/config" 
            element={
              <AdminRoute>
                <PageConfig />
              </AdminRoute>
            } 
          />

          <Route 
            path="/admin/editar-credito/:id" 
            element={
              <AdminRoute>
                <EditCreditPage />
              </AdminRoute>
            } 
          />

          <Route 
            path="/admin/pagos-credito/:id" 
            element={
              <AdminRoute>
                <CreditPaymentPage />
              </AdminRoute>
            } 
          />

          <Route 
            path="/admin/revisar-documentos/:id" 
            element={
              <AdminRoute>
                <DocumentReviewPage />
              </AdminRoute>
            } 
          />

          {/* SECURITY: DevTools solo disponible en desarrollo y solo para admins */}
          {import.meta.env.DEV && (
            <Route 
              path="/admin/dev" 
              element={
                <AdminRoute>
                  <DevTools />
                </AdminRoute>
              } 
            />
          )}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Componentes Persistentes */}
      <ChatBot />

      {/* MODAL GLOBAL DE AUTENTICACIÓN
          Se activa desde cualquier parte de la app mediante openLogin() del context */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={closeLogin} 
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <ScrollToTop />
        <AppContent />
      <ScrollToTop />  
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;