import React from 'react';
import { FiDollarSign, FiArrowRight, FiInfo, FiCheckCircle } from 'react-icons/fi';
import { UserCreditoCard } from '../../../components/User/UserCreditoCard';
import { FormularioKYC } from '../../../components/User/FormularioKYC';
import { NuevaSolicitudModal } from '../../Modals/NuevaSolicitudModal';
import { StepBuro } from '../steps/StepBuro';
import { StepperSolicitud } from '../StepperSolicitud';

export const TabMiCredito = ({ creditos, user, onRefresh }) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const creditoActivo = creditos?.find(c => 
        !['finalizado', 'rechazado'].includes(c.estado?.toLowerCase())
    );
    const [selectedId, setSelectedId] = React.useState(creditoActivo?.id || (creditos && creditos[0]?.id));

    if (!creditos || creditos.length === 0) {
        return (
            <div className="empty-solicitud-state">
                <FiDollarSign size={60} />
                <h2>¿Necesitas financiamiento?</h2>
                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Solicita tu crédito y uno de nuestros asesores te contactará en breve.</p>
                <button 
                    className="btn-primary-action"
                    onClick={() => setIsModalOpen(true)}
                >
                    Nueva Solicitud <FiArrowRight />
                </button>

                <NuevaSolicitudModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        if (onRefresh) onRefresh();
                    }}
                />
            </div>
        );
    }

    const currentCredito = creditos.find(c => c.id === selectedId) || creditos[0];

    const renderActionContent = () => {
        const fase = currentCredito.fase || 1;

        switch (fase) {
            case 1:
                return (
                    <FormularioKYC 
                        user={user} 
                        creditoId={currentCredito.id} 
                        onComplete={onRefresh} 
                    />
                );
            case 2:
                return (
                    <StepBuro 
                        user={user} 
                        credito={currentCredito} 
                        onComplete={onRefresh} 
                    />
                );
            default:
                return (
                    <div className="action-success-state" style={{ padding: '20px', textAlign: 'center', background: 'white', borderRadius: '12px', marginTop: '15px' }}>
                        <FiCheckCircle size={40} color="#10b981" style={{ marginBottom: '10px' }} />
                        <h4 style={{ color: '#0f172a' }}>Paso Completado</h4>
                        <p style={{ color: '#64748b' }}>Tu solicitud está siendo procesada en esta etapa. Revisa frecuentemente.</p>
                    </div>
                );
        }
    };

    return (
        <div className="tab-mi-credito-layout">
            {creditos.length > 1 && (
                <div className="credits-selector-history">
                    {creditos.map(c => (
                        <button 
                            key={c.id} 
                            className={`history-item ${selectedId === c.id ? 'active' : ''}`}
                            onClick={() => setSelectedId(c.id)}
                        >
                            <span className="type">{c.tipo_credito}</span>
                            <span className="date">{new Date(c.createdAt?.toDate ? c.createdAt.toDate() : c.createdAt).toLocaleDateString()}</span>
                        </button>
                    ))}
                </div>
            )}
            <div className="active-process-view" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <StepperSolicitud faseActual={currentCredito.fase || 1} />
                <div className="credit-details-display">
                    <UserCreditoCard 
                        credito={currentCredito} 
                        expediente={currentCredito.expediente || []}
                        onUploadSuccess={onRefresh} 
                    />
                </div>
                {renderActionContent()}
            </div>
        </div>
    );
};