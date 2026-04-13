import React, { useState, useEffect } from 'react';
import { 
    FiSave, FiLoader, FiUser, FiFileText, 
    FiMapPin, FiPhone, FiCalendar, FiBriefcase, 
    FiAlertCircle, FiEdit3, FiCheckCircle, FiArrowRight, FiDollarSign
} from 'react-icons/fi';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useKYC } from '../../pages/hooks/useKYC';
import '../../assets/styles/User/FormularioKYC.css';

export const FormularioKYC = ({ user, creditoId, onComplete }) => {
    const { saveKYC, loading, error } = useKYC();
    const [isEditing, setIsEditing] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    
    const [formData, setFormData] = useState({
        nombreCompleto: '', curp: '', rfc: '', fechaNacimiento: '',
        genero: '', domicilio: '', telefono: '', tipoCredito: 'personal',
        ocupacion: '', ingresos: 0, marcaVehiculo: '', modeloVehiculo: '', anioVehiculo: ''
    });

    const formatGenero = (g) => {
        if (!g) return '';
        const val = g.toUpperCase();
        if (val === 'H' || val === 'HOMBRE') return 'HOMBRE';
        if (val === 'M' || val === 'MUJER') return 'MUJER';
        return 'OTRO';
    };

    const formatFecha = (f) => {
        if (!f || !f.includes('/')) return f;
        const [day, month, year] = f.split('/');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        if (!creditoId) return;

        const creditoRef = doc(db, "creditos", creditoId);
        
        const unsub = onSnapshot(creditoRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                // Prioridad: 1. Datos ya guardados/confirmados, 2. Datos extraídos por IA
                const kycValido = data.datosKYC || data.kycMaster;

                if (kycValido) {
                    const isMaster = !data.datosKYC && !!data.kycMaster;
                    
                    setFormData(prev => ({
                        ...prev,
                        nombreCompleto: (isMaster ? kycValido.perfilIdentidad?.nombreCompleto : kycValido.nombreCompleto) || prev.nombreCompleto,
                        curp: (isMaster ? kycValido.perfilIdentidad?.curp : kycValido.curp) || '',
                        rfc: (isMaster ? kycValido.perfilIdentidad?.rfc : kycValido.rfc) || '',
                        fechaNacimiento: formatFecha(isMaster ? kycValido.perfilIdentidad?.fechaNacimiento : kycValido.fechaNacimiento) || '',
                        genero: formatGenero(isMaster ? kycValido.perfilIdentidad?.genero : kycValido.genero),
                        domicilio: (isMaster ? kycValido.analisisDomicilio?.direccionFinalConsolidada : kycValido.domicilio) || '',
                        ocupacion: (isMaster ? kycValido.perfilFinanciero?.patronOEmpresa : kycValido.ocupacion) || '',
                        ingresos: (isMaster ? kycValido.perfilFinanciero?.ingresoMensualNeto : kycValido.ingresos) || 0,
                        tipoCredito: (isMaster ? (kycValido.datosEspecificosCredito?.tipoDeCredito?.toLowerCase() === 'automotriz' ? 'automotriz' : 'personal') : (kycValido.tipoCredito || 'personal')),
                        marcaVehiculo: (isMaster ? kycValido.datosEspecificosCredito?.detallesAuto?.marca : kycValido.marcaVehiculo) || '',
                        modeloVehiculo: (isMaster ? kycValido.datosEspecificosCredito?.detallesAuto?.modelo : kycValido.modeloVehiculo) || '',
                        anioVehiculo: (isMaster ? kycValido.datosEspecificosCredito?.detallesAuto?.anio : kycValido.anioVehiculo) || ''
                    }));
                    
                    // Si ya hay datos confirmados, no activamos el modo edición automáticamente
                    if (isMaster) setIsEditing(true);
                }
            }
            setInitialLoading(false);
        });

        return () => unsub();
    }, [creditoId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const finalValue = (e.target.type === 'text' || e.target.tagName === 'TEXTAREA') 
            ? value.toUpperCase() 
            : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await saveKYC(user.uid, creditoId, formData);
        if (result.success) {
            setIsEditing(false);
            if (onComplete) onComplete();
        }
    };

    if (initialLoading) {
        return (
            <div className="kyc-loading">
                <FiLoader className="spinner" />
                <p>Sincronizando información...</p>
            </div>
        );
    }

    return (
        <div className="kyc-container animate-fade">
            <div className="kyc-header-info">
                <FiUser className="main-icon" />
                <div className="header-text-btn">
                    <div>
                        <h3>Paso 2: Perfil y Preferencias (KYC)</h3>
                        <p>{isEditing ? "Verifica los datos extraídos de tus documentos." : "Información verificada correctamente."}</p>
                    </div>
                    {!isEditing && (
                        <button className="btn-edit-mode" onClick={() => setIsEditing(true)}>
                            <FiEdit3 /> Corregir Datos
                        </button>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className={`kyc-form ${!isEditing ? 'readonly' : ''}`}>
                {error && <div className="error-banner"><FiAlertCircle /> {error}</div>}
                
                <div className="form-grid">
                    <div className="input-group">
                        <label><FiUser /> Nombre Completo</label>
                        <input type="text" name="nombreCompleto" value={formData.nombreCompleto} onChange={handleChange} required disabled={!isEditing} />
                    </div>
                    <div className="input-group">
                        <label><FiFileText /> CURP</label>
                        <input type="text" name="curp" maxLength="18" value={formData.curp} onChange={handleChange} required disabled={!isEditing} />
                    </div>
                    <div className="input-group">
                        <label><FiFileText /> RFC</label>
                        <input type="text" name="rfc" maxLength="13" value={formData.rfc} onChange={handleChange} required disabled={!isEditing} />
                    </div>
                    <div className="input-group">
                        <label><FiCalendar /> Fecha Nacimiento</label>
                        <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} required disabled={!isEditing} />
                    </div>
                    <div className="input-group">
                        <label>Género</label>
                        <select name="genero" value={formData.genero} onChange={handleChange} required disabled={!isEditing}>
                            <option value="">Seleccionar...</option>
                            <option value="HOMBRE">HOMBRE</option>
                            <option value="MUJER">MUJER</option>
                            <option value="OTRO">OTRO</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label><FiBriefcase /> Empresa / Ocupación</label>
                        <input type="text" name="ocupacion" value={formData.ocupacion} onChange={handleChange} required disabled={!isEditing} />
                    </div>
                    <div className="input-group">
                        <label><FiDollarSign /> Ingresos Mensuales</label>
                        <input type="number" name="ingresos" value={formData.ingresos} onChange={handleChange} required disabled={!isEditing} />
                    </div>
                </div>

                <div className="input-group full-width">
                    <label><FiMapPin /> Domicilio Completo</label>
                    <textarea name="domicilio" value={formData.domicilio} onChange={handleChange} rows="2" required disabled={!isEditing} />
                </div>

                {/* Solo mostramos campos adicionales si el crédito es Automotriz */}
                {formData.tipoCredito === 'automotriz' && (
                    <div className="form-grid" style={{ marginTop: '1rem' }}>
                        <div className="input-group">
                            <label>Marca</label>
                            <input type="text" name="marcaVehiculo" value={formData.marcaVehiculo} onChange={handleChange} disabled={!isEditing} />
                        </div>
                        <div className="input-group">
                            <label>Modelo</label>
                            <input type="text" name="modeloVehiculo" value={formData.modeloVehiculo} onChange={handleChange} disabled={!isEditing} />
                        </div>
                        <div className="input-group">
                            <label>Año</label>
                            <input type="number" name="anioVehiculo" value={formData.anioVehiculo} onChange={handleChange} disabled={!isEditing} />
                        </div>
                    </div>
                )}

                <div className="kyc-footer">
                    {isEditing ? (
                        <button type="submit" className="btn-submit-kyc" disabled={loading}>
                            {loading ? (
                                <><FiLoader className="spinner" /> Guardando...</>
                            ) : (
                                <><FiSave /> Confirmar y Continuar</>
                            )}
                        </button>
                    ) : (
                        <div className="readonly-actions">
                            <p className="verified-msg"><FiCheckCircle /> Datos confirmados.</p>
                            <button type="button" className="btn-next-step" onClick={onComplete}>
                                Siguiente Paso <FiArrowRight />
                            </button>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};