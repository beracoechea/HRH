import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
    FiX, FiUser, FiMail, FiPhone, FiSend, FiLoader, 
    FiCalendar, FiShield, FiFileText, FiChevronDown, FiChevronUp 
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useSolicitudCredito } from '../../pages/hooks/useSolicitudCredito'; // Ruta actualizada
import { StatusModal } from '../Common/StatusModal';
import { formatMoney } from '../../utils/creditCalculations';
import './SolicitudModal.css';

export const SolicitudModal = ({ isOpen, onClose, datosPrestamo }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showAmortization, setShowAmortization] = useState(false);
    
    // Desestructuramos el hook con la lógica de checkboxes corregida
    const {
        formData,
        loading,
        status,
        isFormValid,
        handleInputChange,
        sendSolicitud,
        closeStatus
    } = useSolicitudCredito(user, datosPrestamo, onClose);

    // Seguridad: Si el modal no está abierto o no hay datos de cálculo, no renderizamos nada
    if (!isOpen || !datosPrestamo) return null;

    // Desestructuración segura de los datos del préstamo
    const { 
        quincenasTotales = 0, 
        qAno1 = 0, 
        qAno2 = 0, 
        cuotaQuincenal1 = 0, 
        cuotaQuincenal2 = 0,
        formatStrings = {} 
    } = datosPrestamo;

    const handleLegalRedirect = (e) => {
        e.preventDefault();
        onClose(); // Cerramos el modal antes de navegar
        navigate('/transparencia');
    };

    /**
     * Genera dinámicamente las filas para la tabla de pagos
     */
    const generarFilasAmortizacion = () => {
        const filas = [];
        for (let i = 1; i <= quincenasTotales; i++) {
            const esAno2 = i > qAno1;
            const montoCuota = esAno2 ? cuotaQuincenal2 : cuotaQuincenal1;

            filas.push(
                <tr key={i} className={esAno2 ? 'row-tasa-reducida' : ''}>
                    <td>Q. {i}</td>
                    <td>{formatMoney(montoCuota)}</td>
                    <td>
                        {esAno2 ? (
                            <span className="badge-fidelidad">Fidelidad</span>
                        ) : (
                            <span className="badge-ordinaria">Ordinaria</span>
                        )}
                    </td>
                </tr>
            );
        }
        return filas;
    };

    return ReactDOM.createPortal(
        <>
            <div className={`modal-overlay ${isOpen ? 'show' : ''}`} onClick={!loading ? onClose : null}>
                <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                    
                    <button className="close-modal" onClick={onClose} disabled={loading}>
                        <FiX />
                    </button>
                    
                    <h3>Finaliza tu Solicitud</h3>
                    <p className="modal-subtitle">
                        Solicitud de <strong>{formatStrings.monto || '$0.00'}</strong> a {quincenasTotales} quincenas.
                    </p>
                    
                    <form onSubmit={sendSolicitud} className="appointment-form">
                        <div className="form-section-inputs">
                            <div className="input-group">
                                <FiUser className="input-icon" />
                                <input 
                                    type="text" 
                                    name="nombre" 
                                    placeholder="Nombre completo" 
                                    value={formData.nombre} 
                                    onChange={handleInputChange} 
                                    readOnly={!!user?.nombre} 
                                    className={user?.nombre ? 'input-disabled' : ''} 
                                    required 
                                />
                            </div>

                            <div className="input-group">
                                <FiMail className="input-icon" />
                                <input 
                                    type="email" 
                                    name="correo" 
                                    placeholder="Correo electrónico" 
                                    value={formData.correo} 
                                    onChange={handleInputChange} 
                                    readOnly={!!user} 
                                    className={user ? 'input-disabled' : ''} 
                                    required 
                                />
                            </div>

                            <div className="input-group">
                                <FiPhone className="input-icon" />
                                <input 
                                    type="tel" 
                                    name="telefono" 
                                    placeholder="Teléfono móvil (10 dígitos)" 
                                    maxLength="10" 
                                    value={formData.telefono} 
                                    onChange={handleInputChange} 
                                    required 
                                />
                            </div>
                        </div>

                        <div className="resumen-solicitud-card transparency-mode">
                            <div className="resumen-header">
                                <FiCalendar /> <span>Estructura de Pagos</span>
                            </div>
                            
                            <div className="resumen-item">
                                <span>Quincenas 1 a {qAno1}:</span>
                                <strong>{formatStrings.pago1}</strong>
                            </div>

                            {qAno2 > 0 && (
                                <div className="resumen-item fidelidad-highlight">
                                    <span>Quincenas {qAno1 + 1} a {quincenasTotales}:</span>
                                    <strong className="text-green">{formatStrings.pago2}</strong>
                                </div>
                            )}

                            <div className="resumen-item total-final">
                                <span>Total a pagar estimado:</span>
                                <strong>{formatStrings.total}</strong>
                            </div>

                            <div className="cat-highlight-box">
                                <span className="cat-label">CAT PROMEDIO</span>
                                <span className="cat-value">54.8% <small>SIN IVA</small></span>
                            </div>

                            <button 
                                type="button" 
                                className="btn-amortizacion-trigger" 
                                onClick={() => setShowAmortization(!showAmortization)}
                            >
                                <FiFileText /> {showAmortization ? 'Ocultar Tabla' : 'Ver Tabla de Amortización'}
                                {showAmortization ? <FiChevronUp /> : <FiChevronDown />}
                            </button>

                            {showAmortization && (
                                <div className="amortization-table-container">
                                    <table className="amortization-table">
                                        <thead>
                                            <tr>
                                                <th>Quincena</th>
                                                <th>Pago</th>
                                                <th>Tipo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {generarFilasAmortizacion()}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="legal-section-modal">
                            <div className="warning-box">
                                <FiShield />
                                <p>Cuidamos tu salud financiera. Paga a tiempo para evitar intereses moratorios.</p>
                            </div>

                            <label className="checkbox-container">
                                <input 
                                    type="checkbox" 
                                    name="aceptaTerminos" 
                                    checked={formData.aceptaTerminos} 
                                    onChange={handleInputChange} 
                                    required 
                                />
                                <span className="label-text">
                                    Acepto <a href="#" onClick={handleLegalRedirect}>Términos y Condiciones</a>.
                                </span>
                            </label>

                            <label className="checkbox-container">
                                <input 
                                    type="checkbox" 
                                    name="autorizaBuro" 
                                    checked={formData.autorizaBuro} 
                                    onChange={handleInputChange} 
                                    required 
                                />
                                <span className="label-text">Autorizo consulta de SIC (Buró).</span>
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            className={`btn-submit-final ${loading ? 'btn-loading' : ''}`} 
                            disabled={!isFormValid || loading}
                        >
                            {loading ? (
                                <><FiLoader className="spinner" /> Enviando...</>
                            ) : (
                                <>Confirmar Solicitud <FiSend /></>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <StatusModal 
                isOpen={status.open} 
                type={status.type} 
                message={status.message} 
                onClose={closeStatus} 
            />
        </> ,
        document.body
    );
};