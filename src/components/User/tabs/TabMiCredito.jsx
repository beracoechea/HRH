import React from 'react';
import { FiDollarSign, FiArrowRight, FiInfo, FiCheckCircle } from 'react-icons/fi';
import { UserCreditoCard } from '../../../components/User/UserCreditoCard';
import { FormularioKYC } from '../../../components/User/FormularioKYC';

export const TabMiCredito = ({ creditos, user, onRefresh }) => {
    const creditoActivo = creditos?.find(c => 
        !['finalizado', 'rechazado'].includes(c.estado?.toLowerCase())
    );

    if (!creditoActivo) {
        return (
            <div className="empty-solicitud-state">
                <FiDollarSign size={60} />
                <h2>¿Necesitas financiamiento?</h2>
                <button className="btn-primary-action">Nueva Solicitud <FiArrowRight /></button>
            </div>
        );
    }

    return (
        <div className="active-process-view">
            {/* Aquí solo mostramos el contenido dinámico según la fase */}
            {creditoActivo.fase === 1 ? (
                <FormularioKYC 
                    user={user} 
                    creditoId={creditoActivo.id} 
                    onComplete={onRefresh} 
                />
            ) : (
                <div className="credit-details-display">
                    <UserCreditoCard 
                        credito={creditoActivo} 
                        onUploadSuccess={onRefresh} 
                    />
                </div>
            )}
        </div>
    );
};