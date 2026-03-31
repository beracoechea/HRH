import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePerfil } from '../hooks/usePerfil';
import { 
    FiUser, FiDollarSign, FiCalendar, FiFileText, 
    FiLoader, FiAlertCircle
} from 'react-icons/fi';

// Componentes Globales de Perfil
import { StepperSolicitud } from '../../components/User/StepperSolicitud';

// Componentes de Pestañas
import { TabMiCredito } from '../../components/User/tabs/TabMiCredito';
import { TabCitas } from '../../components/User/tabs/TabCitas';
import { TabEstadosCuenta } from '../../components/User/tabs/TabEstadosCuenta';
import { TabInformacionKYC } from '../../components/User/tabs/TabInformacionKYC';

import '../../assets/styles/MiPerfil.css';

export const MiPerfil = () => {
    const { user, loading: authLoading } = useAuth();
    const { data, loading: perfilLoading, error, refreshData } = usePerfil(user);
    const [activeTab, setActiveTab] = useState('mi-credito');

    // Buscamos el crédito activo para determinar la fase global en el Stepper
    const creditoActivo = data.creditos?.find(c => 
        !['finalizado', 'rechazado'].includes(c.estado?.toLowerCase())
    );

    // --- ESTADOS DE CARGA Y ERROR ---
    if (authLoading || (perfilLoading && (!data || !data.creditos))) {
        return <div className="loader-container-full"><FiLoader className="spinner" /><p>Sincronizando...</p></div>;
    }

    if (error) {
        return <div className="error-state-container"><FiAlertCircle size={40} /><p>{error}</p><button onClick={refreshData} className="btn-retry">Reintentar</button></div>;
    }

    return (
        <div className="perfil-layout-wrapper animate-fade">
            {/* --- CABECERA --- */}
            <header className="perfil-top-bar">
                <div className="user-profile-summary">
                    <div className="avatar-circle">{user?.nombre?.charAt(0).toUpperCase() || "U"}</div>
                    <div className="profile-info">
                        <h1>Hola, {user?.nombre?.split(' ')[0] || 'Usuario'}</h1>
                        <span className="membership-badge">Miembro CrediGO</span>
                    </div>
                </div>

                <nav className="perfil-main-nav">
                    <TabNavItem active={activeTab === 'mi-credito'} onClick={() => setActiveTab('mi-credito')} icon={<FiDollarSign />} label="Mi Crédito" />
                    <TabNavItem active={activeTab === 'kyc'} onClick={() => setActiveTab('kyc')} icon={<FiUser />} label="Mi Información" />
                    <TabNavItem active={activeTab === 'citas'} onClick={() => setActiveTab('citas')} icon={<FiCalendar />} label="Mis Citas" />
                    <TabNavItem active={activeTab === 'historial'} onClick={() => setActiveTab('historial')} icon={<FiFileText />} label="Estados de Cuenta" />
                </nav>
            </header>

            {/* --- STEPPER GLOBAL (Indica el progreso del usuario en la plataforma) --- */}
            <section className="perfil-stepper-section">
                <div className="stepper-container-box">
                    <StepperSolicitud faseActual={creditoActivo?.fase || 1} />
                </div>
            </section>

            {/* --- ÁREA DE CONTENIDO DINÁMICO --- */}
            <main className="perfil-main-content">
                {activeTab === 'mi-credito' && (
                    <TabMiCredito 
                        creditos={data.creditos} 
                        user={user} 
                        onRefresh={refreshData} 
                    />
                )}

                {activeTab === 'kyc' && (
                    <TabInformacionKYC 
                        user={user} 
                        onComplete={() => { refreshData(); setActiveTab('mi-credito'); }} 
                    />
                )}

                {activeTab === 'citas' && (
                    <TabCitas citas={data.citas} />
                )}

                {activeTab === 'historial' && (
                    <TabEstadosCuenta creditos={data.creditos} />
                )}
            </main>
        </div>
    );
};

const TabNavItem = ({ active, onClick, icon, label }) => (
    <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
        {icon} {label}
    </button>
);