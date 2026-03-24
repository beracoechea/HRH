import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiAlertCircle, FiRefreshCw, FiDollarSign, FiCalendar, FiClock, FiEdit2, FiTrendingUp } from 'react-icons/fi';
import { useCreditActions } from '../../pages/hooks/useCreditActions';
import { StatusModal } from '../../components/Common/StatusModal';
import { db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { calcularEstructuraCredito, formatMoney } from '../../utils/creditCalculations';
import { REGLAS_NEGOCIO } from '../../utils/Propiedades';
import '../../assets/styles/AdminCredits.css'; 

export const EditCreditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { updateCreditConditions, loading, status, closeStatus } = useCreditActions();

    const [creditData, setCreditData] = useState(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        monto: 0,
        meses: 0,
        tipo: 'personal',
        tasa: 0 // Tasa mensual en decimal (ej: 0.05)
    });

    useEffect(() => {
        const fetchCredit = async () => {
            try {
                const docRef = doc(db, 'creditos', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setCreditData({ id: docSnap.id, ...data });
                    
                    const monto = Number(data.monto_solicitado) || 0;
                    const tipo = data.tipo_credito?.toLowerCase().includes('auto') ? 'auto' : 'personal';
                    const config = REGLAS_NEGOCIO[tipo] || REGLAS_NEGOCIO.personal;

                    setFormData({
                        monto: monto,
                        meses: Number(data.plazo_meses) || 0,
                        tipo: tipo,
                        tasa: data.tasaMensual || config.tasaMensual
                    });
                } else {
                    setError('El crédito no existe.');
                }
            } catch (err) {
                console.error(err);
                setError('Error al obtener los detalles del crédito.');
            } finally {
                setPageLoading(false);
            }
        };

        if (id) fetchCredit();
    }, [id]);

    const calculos = useMemo(() => {
        return calcularEstructuraCredito(formData.monto, formData.meses, formData.tipo, formData.tasa);
    }, [formData]);

    const handleSave = async (e) => {
        e.preventDefault();
        
        const result = await updateCreditConditions({
            creditoId: id,
            nuevoMonto: Number(formData.monto),
            nuevoPlazo: Number(formData.meses),
            pagoQ1: calculos.cuotaQuincenal1,
            pagoQ2: calculos.cuotaQuincenal2,
            totalEstimado: calculos.totalPagar,
            tasaMensual: formData.tasa
        });

        if (result && result.success) {
            setTimeout(() => navigate('/admin/users'), 1500);
        }
    };

    if (pageLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', backgroundColor: 'var(--app-bg)' }}>
                <FiRefreshCw className="spinner" size={40} color="var(--primary-color)" />
                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Cargando detalles del crédito...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--app-bg)', minHeight: '100vh' }}>
                <FiAlertCircle size={50} color="var(--danger)" />
                <h2 style={{ color: 'var(--text-main)' }}>Error</h2>
                <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
                <button 
                    onClick={() => navigate('/admin/users')} 
                    style={{ padding: '0.75rem 1.5rem', marginTop: '1rem', cursor: 'pointer', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: 'var(--border-radius)' }}
                >
                    Volver
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'var(--font-family)' }}>
            <style>
                {`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spinner {
                    animation: spin 1s linear infinite;
                }
                `}
            </style>
            <button 
                onClick={() => navigate('/admin/users')} 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '2rem', fontSize: '1rem', fontWeight: 500 }}
            >
                <FiArrowLeft /> Regresar a Gestión
            </button>

            <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-md)', overflow: 'hidden', border: '1px solid var(--highlight)' }}>
                <header style={{ backgroundColor: 'var(--dark-bg)', color: 'var(--text-light)', padding: '2rem' }}>
                    <h1 style={{ margin: 0, fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FiEdit2 /> Editar Condiciones de Crédito
                    </h1>
                    <p style={{ margin: '0.75rem 0 0 0', opacity: 0.9, fontSize: '1rem' }}>
                        Cliente: <strong style={{ color: 'var(--secondary-color)' }}>{creditData?.usuario_nombre}</strong> | Ref: {id}
                    </p>
                </header>

                <div style={{ padding: '2rem' }}>
                    <form onSubmit={handleSave}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                            <div className="input-group">
                                <label style={{ display: 'block', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.6rem' }}>Estructura del Producto</label>
                                <select 
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--highlight)', fontSize: '1rem', backgroundColor: '#fff', color: 'var(--text-main)', outline: 'none' }}
                                    value={formData.tipo} 
                                    onChange={(e) => {
                                        const newType = e.target.value;
                                        setFormData({
                                            ...formData, 
                                            tipo: newType,
                                            tasa: REGLAS_NEGOCIO[newType]?.tasaMensual || formData.tasa
                                        });
                                    }}
                                >
                                    <option value="personal">Préstamo Personal</option>
                                    <option value="auto">Crédito Automotriz</option>
                                </select>
                            </div>

                            <div className="input-group" style={{ gridColumn: 'span 2', backgroundColor: 'var(--app-bg)', padding: '1.5rem', borderRadius: 'var(--border-radius)', border: '1px dashed var(--highlight)' }}>
                                <label style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiTrendingUp /> Tasa de Interés Mensual</span>
                                    <span style={{ color: 'var(--primary-color)', fontSize: '1.2rem' }}>{(formData.tasa * 100).toFixed(2)}%</span>
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="15" 
                                        step="0.05"
                                        style={{ flex: 1, accentColor: 'var(--primary-color)', cursor: 'pointer', height: '6px' }}
                                        value={formData.tasa * 100}
                                        onChange={(e) => setFormData({...formData, tasa: Number(e.target.value) / 100})}
                                    />
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        min="0"
                                        style={{ width: '110px', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--primary-color)', fontSize: '1.1rem', textAlign: 'center', fontWeight: 'bold', color: 'var(--primary-color)' }}
                                        value={(formData.tasa * 100).toFixed(2)} 
                                        onChange={(e) => setFormData({...formData, tasa: Number(e.target.value) / 100})} 
                                        required 
                                    />
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '10px' }}>
                                    Ajusta el porcentaje mensual. Los cálculos se reflejarán automáticamente abajo.
                                </p>
                            </div>

                            <div className="input-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.6rem' }}>
                                    <FiDollarSign color="var(--primary-color)" /> Capital Autorizado
                                </label>
                                <input 
                                    type="number" 
                                    min="1000"
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--highlight)', fontSize: '1.1rem', boxSizing: 'border-box', color: 'var(--text-main)', fontWeight: 600 }}
                                    value={formData.monto} 
                                    onChange={(e) => setFormData({...formData, monto: e.target.value})} 
                                    required 
                                />
                            </div>

                            <div className="input-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.6rem' }}>
                                    <FiClock color="var(--primary-color)" /> Plazo del Crédito
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input 
                                        type="number" 
                                        min="1"
                                        max="72"
                                        style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--highlight)', fontSize: '1.1rem', boxSizing: 'border-box', color: 'var(--text-main)', fontWeight: 600 }}
                                        value={formData.meses} 
                                        onChange={(e) => setFormData({...formData, meses: e.target.value})} 
                                        required 
                                    />
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Meses</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ backgroundColor: 'var(--app-bg)', border: '1px solid var(--highlight)', borderRadius: 'var(--border-radius)', padding: '2rem', marginBottom: '2.5rem' }}>
                            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--dark-bg)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem' }}>
                                <FiCalendar /> Resumen de Pagos Proyectados
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                <div style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '10px', boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid var(--primary-color)' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Abono Quincenal (Año 1)</span>
                                    <strong style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}>{formatMoney(calculos.cuotaQuincenal1)}</strong>
                                </div>
                                <div style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '10px', boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid var(--secondary-color)' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Abono Quincenal (Año 2+)</span>
                                    <strong style={{ fontSize: '1.5rem', color: 'var(--secondary-color)' }}>{formatMoney(calculos.cuotaQuincenal2)}</strong>
                                </div>
                                <div style={{ backgroundColor: 'var(--dark-bg)', color: 'var(--text-light)', padding: '1.5rem', borderRadius: '10px', boxShadow: 'var(--shadow-md)', gridColumn: 'span 1' }}>
                                    <span style={{ fontSize: '0.9rem', opacity: 0.8, display: 'block', marginBottom: '0.5rem' }}>Total a Liquidar</span>
                                    <strong style={{ fontSize: '1.6rem' }}>{formatMoney(calculos.totalPagar)}</strong>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--highlight)' }}>
                            <button 
                                type="button" 
                                onClick={() => navigate('/admin/users')}
                                style={{ padding: '0.8rem 2rem', backgroundColor: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                Descartar
                            </button>
                            <button 
                                type="submit" 
                                disabled={loading}
                                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.8rem 2.5rem', backgroundColor: 'var(--primary-color)', border: 'none', color: 'white', borderRadius: '8px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 10px rgba(21, 144, 130, 0.3)' }}
                            >
                                {loading ? <FiRefreshCw className="spinner" /> : <FiSave />}
                                {loading ? 'Sincronizando...' : 'Confirmar Condiciones'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <StatusModal 
                isOpen={status.open}
                type={status.type}
                message={status.message}
                onClose={closeStatus}
            />
        </div>
    );
};
