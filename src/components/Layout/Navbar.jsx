import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { 
  FiHome, FiCpu, FiUsers, FiTrendingUp, 
  FiFileText, FiShield, FiMenu, FiX, 
  FiBriefcase, FiLogIn, FiLogOut, FiSettings, FiChevronDown 
} from 'react-icons/fi';

import '../../assets/styles/Navbar.css'; 
import logoFull from '../../assets/images/LogoChido.png'; 
import logoIcon from '../../assets/images/MovilVerde.png';

import { useAuth } from '../../context/AuthContext';
import { AuthModal } from '../Modals/AuthModal';

// 1. Definición de Permisos Centralizada
const ROLE_PERMISSIONS = {
  admin: { accessAdminPanel: true, canManageUsers: true, canManageNews: true },
  aprobador: { accessAdminPanel: true, canManageUsers: true, canManageNews: false },
  tesorero: { accessAdminPanel: true, canManageUsers: true, canManageNews: false },
  marketing: { accessAdminPanel: true, canManageUsers: false, canManageNews: true },
  cliente: { accessAdminPanel: false, canManageUsers: false, canManageNews: false }
};

export const Navbar = () => {
  const [click, setClick] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [adminDropdown, setAdminDropdown] = useState(false);
  
  const { user, logout, isAuthenticated } = useAuth();
  const permissions = ROLE_PERMISSIONS[user?.rol] || ROLE_PERMISSIONS.cliente;

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => {
    setClick(false);
    setAdminDropdown(false);
  };

  // Ítems base de la navegación
  const navItems = [
    { name: 'Inicio', path: '/', icon: <FiHome /> },
    { name: 'Quiénes Somos', path: '/quienes-somos', icon: <FiUsers /> },
    { name: 'Formatos', path: '/formatos', icon: <FiFileText /> },
    { name: 'Soluciones', path: '/soluciones-financieras', icon: <FiTrendingUp /> },
    { name: 'Simula Crédito', path: '/simulacion', icon: <FiCpu /> },
    { name: 'Noticias', path: '/condusef', icon: <FiShield /> },
  ];

  // Agregar Mi Perfil a todos los usuarios autenticados
  if (isAuthenticated) {
    navItems.push({ name: 'Mi Perfil', path: '/mi-perfil', icon: <FiBriefcase /> });
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
            <img src={logoFull} alt="CrediGO" className="logo-desktop" />
            <img src={logoIcon} alt="CG" className="logo-mobile" />
          </Link>

          <div className="menu-icon" onClick={handleClick}>
            {click ? <FiX /> : <FiMenu />}
          </div>

          <ul className={click ? 'nav-menu active' : 'nav-menu'}>
            {navItems.map((item, index) => (
              <li className="nav-item" key={index}>
                <NavLink 
                  to={item.path} 
                  className={({ isActive }) => "nav-links" + (isActive ? " activated" : "")}
                  onClick={closeMobileMenu}
                >
                  {React.cloneElement(item.icon, { className: 'nav-icon' })} 
                  {item.name}
                </NavLink>
              </li>
            ))}

            {/* --- SECCIÓN ADMINISTRATIVA DINÁMICA --- */}
            {isAuthenticated && permissions.accessAdminPanel && (
              <li 
                className="nav-item dropdown-container"
                onMouseEnter={() => window.innerWidth > 960 && setAdminDropdown(true)}
                onMouseLeave={() => window.innerWidth > 960 && setAdminDropdown(false)}
              >
                <div className="nav-links admin-trigger" onClick={() => setAdminDropdown(!adminDropdown)}>
                  <FiShield className="nav-icon" /> Panel Control <FiChevronDown className={`arrow ${adminDropdown ? 'open' : ''}`} />
                </div>
                
                <ul className={`admin-dropdown ${adminDropdown ? 'show' : ''}`}>
                  {/* Vista para Admin, Aprobador y Tesorero */}
                  {permissions.canManageUsers && (
                    <li>
                      <Link to="/admin/users" onClick={closeMobileMenu}>
                        <FiUsers /> Gestión Operativa
                      </Link>
                    </li>
                  )}
                  
                  {/* Vista para Admin y Marketing */}
                  {permissions.canManageNews && (
                    <li>
                      <Link to="/admin/config" onClick={closeMobileMenu}>
                        <FiSettings /> NewsLetter
                      </Link>
                    </li>
                  )}
                </ul>
              </li>
            )}

            <li className="nav-item">
              {isAuthenticated ? (
                <div className="nav-user-info">
                  <button className="nav-auth-btn logout" onClick={() => { logout(); closeMobileMenu(); }}>
                    <FiLogOut className="nav-icon" /> Salir
                  </button>
                </div>
              ) : (
                <button className="nav-auth-btn login" onClick={() => { setModalOpen(true); closeMobileMenu(); }}>
                  <FiLogIn className="nav-icon" /> Ingresar
                </button>
              )}
            </li>
          </ul>
        </div>
      </nav>
      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};