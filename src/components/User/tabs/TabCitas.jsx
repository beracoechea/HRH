import React from 'react';
import { FiCalendar, FiPlus } from 'react-icons/fi';
import { UserCitaCard } from '../../../components/User/UserCitaCard';
import { AppointmentSidebar } from '../../Common/AppointmentSidebar.jsx';

export const TabCitas = ({ citas = [] }) => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    return (
        <section className="user-citas-container animate-fade">
            <div className="section-header-inline">
                <div>
                    <h2>Gestión de Citas</h2>
                    <p>Historial y estatus de tus asesorías solicitadas.</p>
                </div>
                <button 
                    className="btn-primary-action" 
                    style={{
                        background: '#159082', 
                        color: 'white', 
                        border: 'none', 
                        padding: '0.6rem 1.2rem', 
                        borderRadius: '10px', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '700'
                    }}
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <FiPlus /> Agendar Nueva Cita
                </button>
            </div>

            <div className="citas-list-grid">
                {citas.length > 0 ? (
                    citas.map(cita => (
                        <UserCitaCard key={cita.id} cita={cita} />
                    ))
                ) : (
                    <div className="empty-state-simple" style={{textAlign: 'center', padding: '3rem 1rem'}}>
                        <FiCalendar size={40} color="#cbd5e1" />
                        <p style={{margin: '1rem 0', color: '#64748b'}}>No tienes citas programadas actualmente.</p>
                        <button 
                            className="btn-secondary-action" 
                            style={{
                                background: 'white', 
                                color: '#159082', 
                                border: '2px solid #159082', 
                                padding: '0.5rem 1.5rem', 
                                borderRadius: '10px', 
                                cursor: 'pointer',
                                fontWeight: '700'
                            }}
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            Agendar mi primera cita
                        </button>
                    </div>
                )}
            </div>

            <AppointmentSidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
            />
        </section>
    );
};