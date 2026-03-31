import React from 'react';
import { FiCalendar } from 'react-icons/fi';
import { UserCitaCard } from '../../../components/User/UserCitaCard';

export const TabCitas = ({ citas = [] }) => {
    return (
        <section className="user-citas-container animate-fade">
            <div className="section-header-inline">
                <div>
                    <h2>Gestión de Citas</h2>
                    <p>Historial y estatus de tus asesorías solicitadas.</p>
                </div>
            </div>

            <div className="citas-list-grid">
                {citas.length > 0 ? (
                    citas.map(cita => (
                        <UserCitaCard key={cita.id} cita={cita} />
                    ))
                ) : (
                    <div className="empty-state-simple">
                        <FiCalendar size={40} />
                        <p>No tienes citas programadas actualmente.</p>
                    </div>
                )}
            </div>
        </section>
    );
};