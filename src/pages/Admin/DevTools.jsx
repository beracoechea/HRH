import React, { useState } from 'react';
import { seedTestData } from '../../utils/seedData';
import { FiDatabase, FiCheckCircle, FiLoader, FiAlertCircle, FiArrowLeft, FiFileText, FiRefreshCw } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { migrarCustomClaims } from '../../api/adminApi';

export const DevTools = () => {
    const [status, setStatus] = useState('idle');
    const navigate = useNavigate();

    const handleSeed = async () => {
        setStatus('loading');
        const success = await seedTestData();
        setStatus(success ? 'success' : 'error');
    };

    const handleMigrate = async () => {
        setStatus('migrating');
        try {
            console.log('--- INICIANDO MIGRACIÓN ---');
            const q = query(
                collection(db, 'creditos'),
                where('estado', 'in', ['pendiente', 'revision', 'rechazado', 'esperando_documentacion'])
            );
            const snapshot = await getDocs(q);
            
            const newDoc = {
                nombre: 'Solicitud de Crédito',
                estatus: 'pendiente',
                url: '',
                tipo: 'soporte',
                carpeta: 'Solicitud de Crédito',
                fecha_subida: null
            };

            let count = 0;
            for (const docSnap of snapshot.docs) {
                const data = docSnap.data();
                const exists = (data.expediente || []).some(d => d.nombre === 'Solicitud de Crédito');
                if (!exists) {
                    await updateDoc(doc(db, 'creditos', docSnap.id), {
                        expediente: arrayUnion(newDoc)
                    });
                    count++;
                }
            }
            alert(`Migración completada. ${count} créditos actualizados.`);
            setStatus('success');
        } catch (error) {
            console.error('Error en migración:', error);
            setStatus('error');
        }
    };

    const handleSecurityMigration = async () => {
        setStatus('migrating_claims');
        try {
            const result = await migrarCustomClaims();
            if (result.success) {
                alert(`Seguridad actualizada: Los Custom Claims han sido asignados a todos los usuarios.`);
                setStatus('success');
            } else {
                throw new Error(result.error || 'Error desconocido');
            }
        } catch (error) {
            console.error('Error en migración de seguridad:', error);
            alert('Error en migración: ' + (error.message || error));
            setStatus('error');
        }
    };

    return (
        <div style={{ padding: '4rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <button onClick={() => navigate('/admin')} style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', marginBottom: '2rem' }}>
                <FiArrowLeft /> Volver al Admin
            </button>

            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1e293b', marginBottom: '1rem' }}>Módulo de Desarrollo y Pruebas</h1>
            <p style={{ color: '#64748b', marginBottom: '3rem', fontSize: '1.1rem' }}>Usa estas herramientas para poblar la base de datos y validar el flujo completo de la aplicación.</p>

            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem' }}>
                    <div style={{ background: '#ecfdf5', color: '#10b981', padding: '12px', borderRadius: '14px', fontSize: '1.5rem' }}>
                        <FiDatabase />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Seeder de Base de Datos</h2>
                </div>

                <p style={{ color: '#475569', marginBottom: '2rem' }}>
                    Al ejecutar, se crearán 1 usuario RH y 4 Clientes con sus respectivos créditos (2 Personales y 2 Automotrices) en diferentes fases del proceso operativo.
                </p>

                <button 
                    onClick={handleSeed}
                    disabled={status === 'loading'}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '14px',
                        border: 'none',
                        background: status === 'success' ? '#10b981' : '#159082',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {status === 'loading' && <FiLoader className="spin" />}
                    {status === 'success' && <FiCheckCircle />}
                    {status === 'error' && <FiAlertCircle />}
                    {status === 'idle' ? 'Ejecutar Inserción de Datos Pro' : (status === 'loading' ? 'Procesando...' : (status === 'success' ? 'Éxito: Datos Creados' : 'Error en Inserción'))}
                </button>

                {status === 'success' && (
                    <p style={{ marginTop: '1.5rem', padding: '1rem', background: '#f0fdf4', color: '#166534', borderRadius: '12px', textAlign: 'center', fontSize: '0.9rem' }}>
                        <strong>¡Listo!</strong> Los datos han sido inyectados. Ahora puedes probar los filtros por rol y grupo en el Dashboard Admin.
                    </p>
                )}
            </div>

            {/* --- NUEVA SECCIÓN DE SEGURIDAD --- */}
            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid #159082', marginTop: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem' }}>
                    <div style={{ background: '#f0fdfa', color: '#159082', padding: '12px', borderRadius: '14px', fontSize: '1.5rem' }}>
                        <FiCheckCircle />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Migración de Seguridad (Custom Claims)</h2>
                </div>

                <p style={{ color: '#475569', marginBottom: '2rem' }}>
                    <strong>CRÍTICO:</strong> Esta acción asigna los nuevos roles y grupos directamente en los tokens JWT de los usuarios. Es fundamental para activar la nueva arquitectura de seguridad y que las reglas de Firestore funcionen correctamente.
                </p>

                <button 
                    onClick={handleSecurityMigration}
                    disabled={status === 'migrating_claims'}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '14px',
                        border: 'none',
                        background: '#159082',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {status === 'migrating_claims' && <FiRefreshCw className="spin" />}
                    {status === 'migrating_claims' ? 'Actualizando Seguridad...' : 'Ejecutar Migración de Custom Claims'}
                </button>
                
                <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.8rem', textAlign: 'center' }}>
                    Nota: Los usuarios deberán cerrar sesión y volver a entrar para que los cambios surtan efecto total en su navegador.
                </p>
            </div>

            <div style={{ marginTop: '4rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                <p>Antigravity AI Framework - Professional Audit Mode</p>
            </div>
        </div>
    );
};
