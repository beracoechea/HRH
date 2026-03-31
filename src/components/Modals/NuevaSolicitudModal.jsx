import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { FiX, FiDollarSign, FiCalendar, FiPhone, FiShield, FiSend, FiLoader } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { CreditService } from '../../service/CreditService';
import './SolicitudModal.css';

const creditService = new CreditService();

const MONTOS = [5000, 10000, 15000, 20000, 30000, 50000];
const PLAZOS = [6, 12, 18, 24, 36];

export const NuevaSolicitudModal = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [monto, setMonto] = useState(10000);
    const [plazo, setPlazo] = useState(12);
    const [telefono, setTelefono] = useState(user?.telefono || '');
    const [aceptaTerminos, setAceptaTerminos] = useState(false);
    const [autorizaBuro, setAutorizaBuro] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const isValid =
        telefono.length === 10 &&
        aceptaTerminos &&
        autorizaBuro &&
        monto > 0 &&
        plazo > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValid) { setError('Por favor completa todos los campos y acepta los acuerdos.'); return; }
        setError('');
        setLoading(true);
        try {
            const prestamoData = {
                monto_solicitado: monto,
                plazo_meses: plazo,
                pago_quincenal_ano1: parseFloat(((monto * 1.15) / (plazo * 2)).toFixed(2)),
                pago_quincenal_ano2: 0,
                total_estimado: parseFloat((monto * 1.15).toFixed(2)),
                tipo_credito: 'PERSONAL',
                frecuencia_pago: 'quincenal'
            };
            await creditService.crearSolicitud(
                { ...user, nombre: user?.nombre || user?.displayName || '' },
                prestamoData,
                telefono
            );
            setSuccess(true);
            setTimeout(() => {
                onClose();
                if (onSuccess) onSuccess();
            }, 2000);
        } catch (err) {
            setError('Ocurrió un error al enviar tu solicitud. Intenta de nuevo.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return ReactDOM.createPortal(
        <div className="modal-overlay show" onClick={!loading ? onClose : undefined}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
                <button className="close-modal" onClick={onClose} disabled={loading}><FiX /></button>

                <h3>Nueva Solicitud de Crédito</h3>
                <p className="modal-subtitle">Selecciona el monto y plazo que mejor se adapte a ti.</p>

                {success ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <p style={{ color: '#15803d', fontWeight: 700, fontSize: '1.1rem' }}>
                            ✅ ¡Solicitud enviada exitosamente!
                        </p>
                        <p style={{ color: '#64748b' }}>Nuestro equipo revisará tu documentación en breve.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="appointment-form">
                        {/* Monto */}
                        <div className="form-section-inputs">
                            <label style={{ fontWeight: 700, color: '#374151', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FiDollarSign /> Monto a solicitar
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '1rem' }}>
                                {MONTOS.map(m => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setMonto(m)}
                                        style={{
                                            padding: '0.6rem',
                                            borderRadius: '8px',
                                            border: monto === m ? '2px solid #159082' : '1px solid #e2e8f0',
                                            background: monto === m ? '#f0fafa' : 'white',
                                            color: monto === m ? '#159082' : '#374151',
                                            fontWeight: monto === m ? '700' : '400',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        ${m.toLocaleString()}
                                    </button>
                                ))}
                            </div>

                            {/* Plazo */}
                            <label style={{ fontWeight: 700, color: '#374151', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FiCalendar /> Plazo en meses
                            </label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                {PLAZOS.map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPlazo(p)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '8px',
                                            border: plazo === p ? '2px solid #159082' : '1px solid #e2e8f0',
                                            background: plazo === p ? '#f0fafa' : 'white',
                                            color: plazo === p ? '#159082' : '#374151',
                                            fontWeight: plazo === p ? '700' : '400',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        {p} meses
                                    </button>
                                ))}
                            </div>

                            {/* Resumen estimado */}
                            <div style={{
                                background: '#f8fafc',
                                borderRadius: '10px',
                                padding: '1rem',
                                marginBottom: '1rem',
                                border: '1px solid #e2e8f0'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ color: '#64748b' }}>Monto seleccionado</span>
                                    <strong>${monto.toLocaleString()}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ color: '#64748b' }}>Pago quincenal estimado</span>
                                    <strong style={{ color: '#159082' }}>
                                        ${((monto * 1.15) / (plazo * 2)).toFixed(0)}
                                    </strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Total estimado a pagar</span>
                                    <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>${(monto * 1.15).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Teléfono */}
                            <div className="input-group">
                                <FiPhone className="input-icon" />
                                <input
                                    type="tel"
                                    placeholder="Teléfono de contacto (10 dígitos)"
                                    maxLength="10"
                                    value={telefono}
                                    onChange={e => setTelefono(e.target.value.replace(/\D/g, ''))}
                                    required
                                />
                            </div>
                        </div>

                        <div className="legal-section-modal">
                            <div className="warning-box">
                                <FiShield />
                                <p>Cuidamos tu salud financiera. Paga a tiempo para evitar intereses moratorios.</p>
                            </div>
                            <label className="checkbox-container">
                                <input type="checkbox" checked={aceptaTerminos} onChange={e => setAceptaTerminos(e.target.checked)} required />
                                <span className="label-text">Acepto los Términos y Condiciones.</span>
                            </label>
                            <label className="checkbox-container">
                                <input type="checkbox" checked={autorizaBuro} onChange={e => setAutorizaBuro(e.target.checked)} required />
                                <span className="label-text">Autorizo consulta de SIC (Buró de Crédito).</span>
                            </label>
                        </div>

                        {error && <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</p>}

                        <button
                            type="submit"
                            className={`btn-submit-final ${loading ? 'btn-loading' : ''}`}
                            disabled={!isValid || loading}
                        >
                            {loading ? <><FiLoader className="spinner" /> Enviando...</> : <>Confirmar Solicitud <FiSend /></>}
                        </button>
                    </form>
                )}
            </div>
        </div>,
        document.body
    );
};
