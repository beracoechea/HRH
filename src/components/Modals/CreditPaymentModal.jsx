/* src/components/Modals/CreditPaymentModal.jsx */
import React, { useState } from 'react';
import { FiX, FiPlus, FiEdit, FiSave } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export const CreditPaymentModal = ({ credito, onClose, onUpdate }) => {
  const { user } = useAuth(); 
  const [monto, setMonto] = useState('');
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [nuevoTotal, setNuevoTotal] = useState(credito.pagado || 0);

  const handleAddPayment = async () => {
    if (!monto || monto <= 0) return;
    
    await onUpdate({
      creditoId: credito.id,
      montoAbono: parseFloat(monto),
      adminId: user?.id
    });
    onClose();
  };

  const handleCorrection = async () => {
    await onUpdate({
      creditoId: credito.id,
      montoTotalCorregido: parseFloat(nuevoTotal),
      adminId: user?.id 
    });
    onClose();
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0, left: 0,
    width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  };

  const cardStyle = {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={cardStyle} onClick={e => e.stopPropagation()}>
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>Gestión de Crédito #{credito.id}</h3>
          <button onClick={onClose} style={{ cursor: 'pointer', border: 'none', background: 'none', fontSize: '1.5rem' }}><FiX /></button>
        </header>

        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <p><strong>Cliente:</strong> {credito.usuario_nombre}</p>
          <p><strong>Deuda Total:</strong> ${Number(credito.totalTeorico).toLocaleString()}</p>
          <div style={{ color: '#159082', fontWeight: 'bold' }}>
            Pagado: {isEditingTotal ? (
              <input 
                type="number" 
                value={nuevoTotal} 
                onChange={(e) => setNuevoTotal(e.target.value)} 
                style={{ width: '100px', padding: '4px' }} 
              />
            ) : `$${Number(credito.pagado).toLocaleString()}`}
          </div>
        </div>

        {!isEditingTotal ? (
          <div className="action-section">
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Registrar Abono:</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="number" 
                placeholder="0.00" 
                style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
              />
              <button 
                onClick={handleAddPayment}
                style={{ backgroundColor: '#159082', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer' }}
              >
                <FiPlus /> Abonar
              </button>
            </div>
            <button 
              onClick={() => setIsEditingTotal(true)}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', marginTop: '1rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              <FiEdit /> Corregir histórico
            </button>
          </div>
        ) : (
          <div style={{ border: '1px solid #fee2e2', padding: '1rem', borderRadius: '8px', background: '#fef2f2' }}>
            <p style={{ color: '#b91c1c', fontSize: '0.8rem', margin: '0 0 1rem 0' }}>Editando el total acumulado directamente.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleCorrection} style={{ backgroundColor: '#159082', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                <FiSave /> Guardar Corrección
              </button>
              <button onClick={() => setIsEditingTotal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};