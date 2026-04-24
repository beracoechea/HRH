import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  FiHome, FiCpu, FiUsers, FiTrendingUp,
  FiFileText, FiShield, FiMenu, FiX,
  FiBriefcase, FiLogIn, FiLogOut, FiSettings, FiChevronDown, FiChevronUp
} from 'react-icons/fi';

import '../../assets/styles/Navbar.css';
import logoFull from '../../assets/images/LogoChido.png';
import logoIcon from '../../assets/images/MovilVerde.png';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from '../Modals/AuthModal';
import { ROLE_PERMISSIONS } from '../../helpers/permissions';

export const Navbar = () => {
  const [click, setClick] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [adminDropdown, setAdminDropdown] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const { user, logout, isAuthenticated } = useAuth();

  // Determinar permisos y tipo de usuario usando la matriz centralizada
  const permissions = ROLE_PERMISSIONS[user?.rol] || ROLE_PERMISSIONS.cliente;
  const isStaff = permissions.accessAdminPanel;

  const canSeeUsers = permissions.views?.includes('usuarios');
  const canSeeConfig = permissions.views?.includes('config');

  const handleClick = () => setClick(!click);

  const closeMobileMenu = () => {
    setClick(false);
    setAdminDropdown(false);
  };

  // Ítems base de la navegación (Públicos)
  const navItems = [
    { name: 'Inicios', path: '/', icon: <FiHome /> },
    { name: 'Quiénes Somos', path: '/quienes-somos', icon: <FiUsers /> },
    { name: 'Requerimientos', path: '/formatos', icon: <FiFileText /> },
    { name: 'Soluciones', path: '/soluciones-financieras', icon: <FiTrendingUp /> },
    { name: 'Simula Crédito', path: '/simulacion', icon: <FiCpu /> },
    { name: 'Noticias', path: '/condusef', icon: <FiShield /> },
  ];

  return (
    <>
      <div
        className={`nav-toggle-visibility ${isHidden ? 'visible' : ''}`}
        onClick={() => setIsHidden(false)}
        title="Mostrar Menú Principal"
      >
        <FiChevronDown />
      </div>

      <nav className={`navbar ${isHidden ? 'hidden' : ''}`}>
        <div className="navbar-container">
          <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
            <img src={logoFull} alt="CrediGO" className="logo-desktop" />
            <img src={logoIcon} alt="CG" className="logo-mobile" />
          </Link>

          <div className="menu-icon" onClick={handleClick}>
            {click ? <FiX /> : <FiMenu />}
          </div>

          <ul className={click ? 'nav-menu active' : 'nav-menu'}>
            {/* Renderizado de ítems públicos */}
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

            {/* --- SECCIÓN DE USUARIO AUTENTICADO --- */}
            {isAuthenticated && (
              <>
                {/* 1. VISTA PARA CLIENTE: Botón Mi Perfil Directo */}
                {!isStaff ? (
                  <li className="nav-item">
                    <NavLink
                      to="/mi-perfil"
                      className={({ isActive }) => "nav-links" + (isActive ? " activated" : "")}
                      onClick={closeMobileMenu}
                    >
                      <FiBriefcase className="nav-icon" /> Mi Perfil
                    </NavLink>
                  </li>
                ) : (
                  /* 2. VISTA PARA STAFF (Admin, etc): Menú Encapsulado */
                  <li
                    className="nav-item dropdown-container"
                    onMouseEnter={() => window.innerWidth > 960 && setAdminDropdown(true)}
                    onMouseLeave={() => window.innerWidth > 960 && setAdminDropdown(false)}
                  >
                    <div className="nav-links admin-trigger" onClick={() => setAdminDropdown(!adminDropdown)}>
                      <FiSettings className="nav-icon" /> Gestionar <FiChevronDown className={`arrow ${adminDropdown ? 'open' : ''}`} />
                    </div>

                    <ul className={`admin-dropdown ${adminDropdown ? 'show' : ''}`}>
                      {/* Mi Perfil movido aquí para Staff */}
                      <li>
                        <Link to="/mi-perfil" onClick={closeMobileMenu}>
                          <FiBriefcase className="nav-icon-drop" /> Mi Perfil
                        </Link>
                      </li>

                      {/* Divisor visual */}
                      <li className="dropdown-divider"></li>

                      {/* Opciones Administrativas según permisos dinámicos */}
                      {canSeeUsers && (
                        <li>
                          <Link to="/admin/users" onClick={closeMobileMenu}>
                            <FiUsers className="nav-icon-drop" /> Gestión Operativa
                          </Link>
                        </li>
                      )}

                      {canSeeConfig && (
                        <li>
                          <Link to="/admin/config" onClick={closeMobileMenu}>
                            <FiSettings className="nav-icon-drop" /> Configuración
                          </Link>
                        </li>
                      )}
                    </ul>
                  </li>
                )}
              </>
            )}

            {/* Botón de Auth (Login/Logout) */}
            <li className="nav-item">
              {isAuthenticated ? (
                <button className="nav-auth-btn logout" onClick={() => { logout(); closeMobileMenu(); }}>
                  <FiLogOut className="nav-icon" /> Salir
                </button>
              ) : (
                <button className="nav-auth-btn login" onClick={() => { setModalOpen(true); closeMobileMenu(); }}>
                  <FiLogIn className="nav-icon" /> Ingresar
                </button>
              )}
            </li>

            <li className="nav-item">
              <button className="hide-nav-trigger" onClick={() => setIsHidden(true)} title="Ocultar Navbar para maximizar espacio">
                <FiChevronUp />
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Modal de Autenticación */}
      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};