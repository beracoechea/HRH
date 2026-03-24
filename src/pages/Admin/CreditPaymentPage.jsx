import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    FiArrowLeft, FiPlus, FiEdit, FiSave, FiAlertCircle, 
    FiCheckCircle, FiDollarSign, FiClock, FiUser, FiRefreshCw 
} from 'react-icons/fi';
import { useCreditActions } from '../../pages/hooks/useCreditActions';
import { StatusModal } from '../../components/Common/StatusModal';
import { db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { formatMoney } from '../../utils/creditCalculations';
import { useAuth } from '../../context/AuthContext';

export const CreditPaymentPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { registerPayment, correctTotalPaid, loading, status, closeStatus } = useCreditActions();

    const [credit, setCredit] = useState(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados del formulario
    const [montoAbono, setMontoAbono] = useState('');
    const [isEditingFull, setIsEditingFull] = useState(false);
    const [corregirTotal, setCorregirTotal] = useState('');

    const fetchCredit = async () => {
        try {
            const docRef = doc(db, 'creditos', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setCredit({ id: docSnap.id, ...data });
                setCorregirTotal(data.pagado || 0);
            } else {
                setError('El crédito no existe.');
            }
        } catch (err) {
            console.error(err);
            setError('Error al obtener la información del crédito.');
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchCredit();
    }, [id]);

    const handleAbonar = async (e) => {
        e.preventDefault();
        if (!montoAbono || montoAbono <= 0) return;
        
        const success = await registerPayment(id, montoAbono, user?.id);
        if (success) {
            setMontoAbono('');
            fetchCredit(); // Recargar datos
        }
    };

    const handleCorreccion = async (e) => {
        e.preventDefault();
        const success = await correctTotalPaid(id, corregirTotal, user?.id);
        if (success) {
            setIsEditingFull(false);
            fetchCredit();
        }
    };

    if (pageLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', backgroundColor: 'var(--app-bg)' }}>
                <FiRefreshCw className="spinner" size={40} color="var(--primary-color)" />
                <style>{`@keyframes spin { from {transform: rotate(0deg);} to {transform: rotate(360deg);} } .spinner { animation: spin 1s linear infinite; }`}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--app-bg)', minHeight: '100vh' }}>
                <FiAlertCircle size={50} color="var(--danger)" />
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/admin/users')} className="btn-primary">Volver</button>
            </div>
        );
    }

    const porcentajePagado = Math.min(Math.round(((credit.pagado || 0) / (credit.total_estimado || 1)) * 100), 100);

    return (
        <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'var(--font-family)' }}>
            <button 
                onClick={() => navigate('/admin/users')} 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '2rem', fontSize: '1rem' }}
            >
                <FiArrowLeft /> Regresar a Gestión
            </button>

            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--dark-bg)' }}>Gestión de Pagos</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        ID Crédito: <span style={{ fontWeight: 600 }}>#{id}</span>
                    </p>
                </div>
                <div style={{ backgroundColor: 'var(--card-bg)', padding: '0.5rem 1rem', borderRadius: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--highlight)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Estatus: </span>
                    <strong style={{ color: credit.estado === 'activo' ? 'var(--success)' : 'var(--warning)', textTransform: 'uppercase', fontSize: '0.9rem' }}>{credit.estado}</strong>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* COLUMNA INFO */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <section style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--border-radius)', padding: '2rem', boxShadow: 'var(--shadow-md)', borderTop: '5px solid var(--primary-color)' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--dark-bg)' }}>
                            <FiUser color="var(--primary-color)" /> Detalles del Cliente
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Nombre Completo</label>
                                <strong style={{ fontSize: '1.1rem' }}>{credit.usuario_nombre}</strong>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Correo Electronico</label>
                                <span>{credit.usuario_email}</span>
                            </div>
                            <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--app-bg)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Progreso de Liquidación</span>
                                    <span style={{ color: 'var(--primary-color)', fontWeight: 700 }}>{porcentajePagado}%</span>
                                </div>
                                <div style={{ height: '10px', backgroundColor: 'var(--app-bg)', borderRadius: '5px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${porcentajePagado}%`, backgroundColor: 'var(--primary-color)', borderRadius: '5px', transition: 'width 0.5s ease-out' }}></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section style={{ backgroundColor: 'var(--dark-bg)', borderRadius: 'var(--border-radius)', padding: '2rem', color: 'var(--text-light)', boxShadow: 'var(--shadow-md)' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--highlight)' }}>
                            <FiDollarSign /> Resumen Financiero
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ opacity: 0.8 }}>Monto Original</span>
                                <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{formatMoney(credit.monto_solicitado)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ opacity: 0.8 }}>Total con Intereses</span>
                                <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{formatMoney(credit.total_estimado)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <span style={{ color: 'var(--secondary-color)', fontWeight: 600 }}>Total Pagado</span>
                                <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--secondary-color)' }}>{formatMoney(credit.pagado || 0)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                                <span style={{ fontWeight: 600 }}>Saldo Pendiente</span>
                                <span style={{ fontWeight: 800, fontSize: '1.4rem', color: '#fff' }}>{formatMoney((credit.total_estimado || 0) - (credit.pagado || 0))}</span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* COLUMNA ACCIONES */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <section style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--border-radius)', padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--dark-bg)' }}>
                            <FiPlus color="var(--primary-color)" /> Registrar Nuevo Abono
                        </h2>
                        <form onSubmit={handleAbonar}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Monto a recibir</label>
                                <div style={{ position: 'relative' }}>
                                    <FiDollarSign style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-color)' }} />
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        placeholder="0.00"
                                        style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', borderRadius: '8px', border: '2px solid var(--highlight)', fontSize: '1.2rem', fontWeight: 600, color: 'var(--dark-bg)' }}
                                        value={montoAbono}
                                        onChange={(e) => setMontoAbono(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                style={{ width: '100%', padding: '1rem', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(21, 144, 130, 0.2)' }}
                            >
                                {loading ? <FiRefreshCw className="spinner" /> : <FiCheckCircle />}
                                {loading ? 'Procesando...' : 'Confirmar Abono'}
                            </button>
                        </form>
                    </section>

                    <section style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--border-radius)', padding: '2.5rem 2rem', border: '1px solid var(--highlight)' }}>
                        {!isEditingFull ? (
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>¿Hubo un error en el registro histórico?</p>
                                <button 
                                    onClick={() => setIsEditingFull(true)}
                                    style={{ background: 'none', border: 'none', color: 'var(--secondary-color)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}
                                >
                                    <FiEdit /> Corregir Saldo Total
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleCorreccion}>
                                <h3 style={{ fontSize: '1rem', color: 'var(--danger)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FiAlertCircle /> Corrección Manual
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                    Esto sobrescribirá el monto total pagado hasta la fecha. Úselo solo para correcciones administrativas.
                                </p>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--secondary-color)', fontSize: '1.1rem', textAlign: 'center' }}
                                        value={corregirTotal}
                                        onChange={(e) => setCorregirTotal(e.target.value)}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        style={{ flex: 2, padding: '0.6rem', backgroundColor: 'var(--dark-bg)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        <FiSave /> Guardar
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setIsEditingFull(false)}
                                        style={{ flex: 1, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>
                </div>
            </div>

            <StatusModal 
                isOpen={status.open}
                type={status.type}
                message={status.message}
                onClose={closeStatus}
            />

            <style>{`
                @keyframes spin { from {transform: rotate(0deg);} to {transform: rotate(360deg);} }
                .spinner { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
};
