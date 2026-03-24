/* src/components/Modals/EditCreditModal.jsx */
import React, { useState, useMemo } from 'react';
import { FiX, FiSave, FiRefreshCw, FiDollarSign, FiCalendar } from 'react-icons/fi';
import { StatusModal } from '../Common/StatusModal';
import { useCreditActions } from '../../pages/hooks/useCreditActions';
import '../../assets/styles/ManageDocModal.css';

export const EditCreditModal = ({ credit, onClose, onRefreshList }) => {
    const { updateCreditConditions, loading } = useCreditActions(); 
    
    const [formData, setFormData] = useState({
        monto: credit.monto_solicitado,
        plazo: credit.plazo_meses,
        tipo: credit.monto_solicitado > 50000 ? 'auto' : 'personal'
    });

    const [status, setStatus] = useState({ open: false, type: '', message: '' });

    const calculos = useMemo(() => {
        const tasaMensual = formData.tipo === 'personal' ? 0.05 : 0.0175;
        const tasaQuincenal = tasaMensual / 2;
        
        const pagoQuincenalAno1 = formData.monto * tasaQuincenal;
        
        let pagoQuincenalAno2 = 0;
        if (formData.plazo > 12) {
            const mesesRestantes = formData.plazo - 12;
            const quincenasRestantes = mesesRestantes * 2;
            
            const amortizacionCapital = formData.monto / quincenasRestantes;
            const interesConDescuento = formData.monto * (tasaQuincenal / 2);
            
            pagoQuincenalAno2 = amortizacionCapital + interesConDescuento;
        }

        return {
            pagoQ1: pagoQuincenalAno1,
            pagoQ2: pagoQuincenalAno2,
            tasaLabel: (tasaQuincenal * 100).toFixed(2) + '%'
        };
    }, [formData]);

    const handleSave = async () => {
        try {
            const result = await updateCreditConditions({
                id: credit.id,
                monto_solicitado: formData.monto,
                plazo_meses: formData.plazo,
                // ENVIAMOS DATOS CON NOMENCLATURA QUINCENAL
                pago_quincenal_ano1: calculos.pagoQ1,
                pago_quincenal_ano2: calculos.pagoQ2
            });

            if (result.success) {
                // Actualizamos la lista principal para reflejar cambios en la tabla admin
                if (onRefreshList) await onRefreshList(); 

                setStatus({
                    open: true,
                    type: 'success',
                    message: '¡Condiciones Quincenales Actualizadas!'
                });
                
                setTimeout(() => onClose(), 1200);
            }
        } catch (error) {
            setStatus({
                open: true,
                type: 'error',
                message: error.message || 'Error de conexión con el servidor.'
            });
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content doc-manager animate-pop" onClick={e => e.stopPropagation()} style={{maxWidth: '500px'}}>
                <header className="modal-header">
                    <button className="close-btn" onClick={onClose}><FiX /></button>
                    <h2>Editar Condiciones</h2>
                    <p>Folio: <strong>#{credit.id}</strong> - {credit.usuario_nombre}</p>
                </header>

                <div className="docs-review-scroll-area">
                    <div className="edit-form-grid">
                        <div className="input-group-admin">
                            <label>Tipo de Crédito</label>
                            <select 
                                value={formData.tipo} 
                                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                                disabled={loading}
                            >
                                <option value="personal">Personal</option>
                                <option value="auto">Automotriz </option>
                            </select>
                        </div>

                        <div className="input-group-admin">
                            <label><FiDollarSign /> Monto del Crédito</label>
                            <input 
                                type="number" 
                                value={formData.monto}
                                onChange={(e) => setFormData({...formData, monto: parseFloat(e.target.value) || 0})}
                                disabled={loading}
                            />
                        </div>

                        <div className="input-group-admin">
                            <label><FiCalendar /> Plazo Solicitado (Meses)</label>
                            <input 
                                type="number" 
                                value={formData.plazo}
                                onChange={(e) => setFormData({...formData, plazo: parseInt(e.target.value) || 0})}
                                disabled={loading}
                            />
                            <small style={{color: '#64748b'}}>Equivale a {formData.plazo * 2} quincenas</small>
                        </div>

                        <div className="recalc-preview quincenal">
                            <h4><FiRefreshCw /> Proyección Quincenal</h4>
                            <div className="preview-row">
                                <span>Tasa por Periodo:</span> <strong>{calculos.tasaLabel}</strong>
                            </div>
                            <div className="preview-row">
                                <span>Pago Quincena. Año 1:</span> <strong>${calculos.pagoQ1.toLocaleString('es-MX', {minimumFractionDigits: 2})}</strong>
                            </div>
                            {formData.plazo > 12 && (
                                <div className="preview-row">
                                    <span>Pago Quincena. Año 2+:</span> <strong>${calculos.pagoQ2.toLocaleString('es-MX', {minimumFractionDigits: 2})}</strong>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <footer className="modal-footer-obs">
                    <button 
                        className="btn-save-admin" 
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : <><FiSave /> Guardar Cambios</>}
                    </button>
                </footer>

                <StatusModal 
                    isOpen={status.open}
                    type={status.type}
                    message={status.message}
                    onClose={() => setStatus({ ...status, open: false })}
                />
            </div>
        </div>
    );
};