import React from 'react';
import { FiDollarSign, FiInfo, FiCheckCircle } from 'react-icons/fi';
import { UserCreditoCard } from '../../../components/User/UserCreditoCard';
import { FormularioKYC } from '../../../components/User/FormularioKYC';
import { StepBuro } from '../steps/StepBuro';
import { StepperSolicitud } from '../StepperSolicitud';

export const TabMiCredito = ({ creditos, user, onRefresh }) => {
    if (!creditos || creditos.length === 0) {
        return (
            <div className="empty-solicitud-state" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <FiDollarSign size={60} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                <h2 style={{ color: '#0f172a' }}>Consulta de Financiamiento</h2>
                <p style={{ color: '#64748b' }}>Actualmente no cuentas con solicitudes activas.</p>
            </div>
        );
    }

    const creditoActivo = creditos?.find(c => 
        !['finalizado', 'rechazado'].includes(c.estado?.toLowerCase())
    );
    
    const [selectedId, setSelectedId] = React.useState(creditoActivo?.id || creditos[0]?.id);
    const currentCredito = creditos.find(c => c.id === selectedId) || creditos[0];
    const faseActual = currentCredito.fase || 1;

    return (
        <div className="tab-mi-credito-layout">
            {/* Selector de historial (si hay más de uno) */}
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

            <div className="active-process-view" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                
                <StepperSolicitud faseActual={faseActual} />

                {/* --- PASO 1: DOCUMENTACIÓN (Siempre visible) --- */}
                <div className="step-container">
                    <UserCreditoCard 
                        credito={currentCredito} 
                        expediente={currentCredito.expediente || []}
                        onUploadSuccess={onRefresh} 
                    />
                    {faseActual === 1 && (
                        <div className="action-info-state" style={{ padding: '20px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', marginTop: '10px', border: '1px dashed #cbd5e1' }}>
                            <FiInfo size={24} color="#3b82f6" style={{ marginBottom: '8px' }} />
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Sube tus documentos para habilitar el siguiente paso.</p>
                        </div>
                    )}
                </div>

                {/* --- PASO 2: FORMULARIO KYC (Se revela si fase >= 2) --- */}
                {faseActual >= 2 && (
                    <div className="step-container animate-fade-down">
                        <div className="step-badge-status">
                            {faseActual > 2 ? <span className="completed-tag"><FiCheckCircle /> Información Verificada</span> : null}
                        </div>
                        <FormularioKYC 
                            user={user} 
                            creditoId={currentCredito.id} 
                            kycData={currentCredito.kycData} 
                            onComplete={onRefresh} 
                        />
                    </div>
                )}

                {/* --- PASO 3: BURÓ DE CRÉDITO (Se revela si fase >= 3) --- */}
                {faseActual >= 3 && (
                    <div className="step-container animate-fade-down">
                         <div className="step-badge-status">
                            {faseActual > 3 ? <span className="completed-tag"><FiCheckCircle /> Consulta Exitosa</span> : null}
                        </div>
                        <StepBuro 
                            user={user} 
                            credito={currentCredito} 
                            onComplete={onRefresh} 
                        />
                    </div>
                )}

                {/* Mensaje final si ya superó todas las fases interactivas */}
                {faseActual > 3 && (
                    <div className="action-success-state" style={{ padding: '30px', textAlign: 'center', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <FiCheckCircle size={40} color="#10b981" style={{ marginBottom: '10px' }} />
                        <h4 style={{ color: '#0f172a' }}>¡Todo listo!</h4>
                        <p style={{ color: '#64748b' }}>Tu solicitud ha sido completada con éxito. Un asesor revisará la información final y te contactará.</p>
                    </div>
                )}
            </div>
        </div>
    );
};