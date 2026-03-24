import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePerfil } from '../hooks/usePerfil';
import { FiUser, FiCalendar, FiDollarSign, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { UserCitaCard } from '../../components/User/UserCitaCard';
import { UserCreditoCard } from '../../components/User/UserCreditoCard';
import { PaymentProgressCard } from '../../components/User/PaymentProgressCard';
import '../../assets/styles/MiPerfil.css';

export const MiPerfil = () => {
    const { user, loading: authLoading } = useAuth();
    const { activeTab, setActiveTab, data, loading: perfilLoading, error, refreshData } = usePerfil(user);

    // Estado de carga inicial (Auth + Perfil)
    if (authLoading || (perfilLoading && data.citas.length === 0)) {
        return (
            <div className="loader-container">
                <FiLoader className="spinner" />
                <p>Sincronizando con CrediGO...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-state">
                <FiAlertCircle /> 
                <p>{error}</p>
                <button onClick={refreshData}>Reintentar</button>
            </div>
        );
    }

    return (
        <div className="perfil-container animate-fade">
            <header className="perfil-header">
                <div className="user-welcome">
                    <div className="avatar-large">
                        {/* Priorizar nombre, luego email, luego fallback */}
                        {user?.nombre?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="welcome-text">
                        <h1>Hola, {user?.nombre || user?.email?.split('@')[0] || 'Usuario'}</h1>
                        <p><FiUser /> {user?.email ? 'Miembro CrediGO' : 'No es miembro'}</p>
                    </div>
                </div>
            </header>

            <nav className="perfil-tabs">
                <button 
                    className={activeTab === 'citas' ? 'active' : ''} 
                    onClick={() => setActiveTab('citas')}
                >
                    <FiCalendar /> Mis Citas
                </button>
                <button 
                    className={activeTab === 'creditos' ? 'active' : ''} 
                    onClick={() => setActiveTab('creditos')}
                >
                    <FiDollarSign /> Mis Créditos
                </button>
            </nav>

            <main className="perfil-content">
                {activeTab === 'citas' ? (
                    <section className="section-container">
                        <h2>Seguimiento de Asesorías</h2>
                        {data.citas && data.citas.length > 0 ? (
                            <div className="citas-grid">
                                {data.citas.map(cita => (
                                    <UserCitaCard key={cita.id} cita={cita} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon={<FiCalendar />} text="No tienes citas agendadas todavía." />
                        )}
                    </section>
                ) : (
                    <section className="section-container">
                        <h2>Estado de Cuenta Actual</h2>
                        {data.creditos && data.creditos.length > 0 ? (
                            <div className="creditos-list-perfil">
                                {data.creditos.map(c => (
                                    <div key={c.id} className="credito-container-full">
                                        <UserCreditoCard 
                                            credito={c} 
                                            expediente={c.expediente} 
                                            onUploadSuccess={refreshData} 
                                        />
                                        {['activo', 'pagado'].includes(c.estado?.toLowerCase()) && (
                                            <PaymentProgressCard credito={c} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon={<FiDollarSign />} text="No hay créditos registrados a tu nombre." />
                        )}
                    </section>
                )}
            </main>
        </div>
    );
};

const EmptyState = ({ icon, text }) => (
    <div className="empty-state-perfil">
        <div className="empty-icon">{icon}</div>
        <p>{text}</p>
    </div>
);