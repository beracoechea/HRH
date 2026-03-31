import React, { useState, useEffect } from 'react';
import { 
    FiSave, FiLoader, FiUser, FiFileText, 
    FiMapPin, FiPhone, FiCalendar, FiBriefcase, FiAlertCircle, FiEdit3,FiCheckCircle, FiArrowRight
} from 'react-icons/fi';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useKYC } from '../../pages/hooks/useKYC';
import '../../assets/styles/User/FormularioKYC.css';

export const FormularioKYC = ({ user, creditoId, onComplete }) => {
    const { saveKYC, loading, error } = useKYC();
    const [isEditing, setIsEditing] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    
    const [formData, setFormData] = useState({
        nombreCompleto: user?.nombre || '',
        curp: '',
        rfc: '',
        fechaNacimiento: '',
        genero: '',
        domicilio: '',
        telefono: '',
        tipoCredito: 'nomina',
        ocupacion: ''
    });

    // --- CARGAR DATOS EXISTENTES AL MONTAR ---
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const kycRef = doc(db, "usuarios", user.uid, "perfil", "kyc");
                const docSnap = await getDoc(kycRef);

                if (docSnap.exists()) {
                    setFormData(docSnap.data());
                    setIsEditing(false); // Si existen datos, mostrar vista de lectura
                } else {
                    setIsEditing(true); // Si no hay datos, habilitar edición
                }
            } catch (err) {
                console.error("Error cargando KYC:", err);
            } finally {
                setInitialLoading(false);
            }
        };

        if (user?.uid) fetchUserData();
    }, [user.uid]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value.toUpperCase() });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.curp.length !== 18) {
            alert("La CURP debe tener exactamente 18 caracteres.");
            return;
        }

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
                <p>Cargando tu información...</p>
            </div>
        );
    }

    return (
        <div className="kyc-container animate-fade">
            <div className="kyc-header-info">
                <FiUser className="main-icon" />
                <div className="header-text-btn">
                    <div>
                        <h3>Fase 1: Perfilamiento y KYC</h3>
                        <p>{isEditing ? "Completa o actualiza tu información legal." : "Verifica que tu información sea correcta para continuar."}</p>
                    </div>
                    {!isEditing && (
                        <button className="btn-edit-mode" onClick={() => setIsEditing(true)}>
                            <FiEdit3 /> Editar Datos
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
                        <label><FiCalendar /> Fecha de Nacimiento</label>
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
                        <label><FiPhone /> Teléfono Celular</label>
                        <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required disabled={!isEditing} />
                    </div>

                    <div className="input-group">
                        <label><FiBriefcase /> Tipo de Crédito</label>
                        <select name="tipoCredito" value={formData.tipoCredito} onChange={handleChange} required disabled={!isEditing}>
                            <option value="nomina">CRÉDITO PERSONAL</option>
                            <option value="automotriz">CRÉDITO AUTOMOTRIZ</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label><FiBriefcase /> Ocupación</label>
                        <input type="text" name="ocupacion" value={formData.ocupacion} onChange={handleChange} required disabled={!isEditing} />
                    </div>
                </div>

                <div className="input-group full-width">
                    <label><FiMapPin /> Domicilio Particular Completo</label>
                    <textarea name="domicilio" value={formData.domicilio} onChange={handleChange} rows="2" required disabled={!isEditing} />
                </div>

                <div className="kyc-footer">
                    {isEditing ? (
                        <button type="submit" className="btn-submit-kyc" disabled={loading}>
                            {loading ? <><FiLoader className="spinner" /> Guardando...</> : <><FiSave /> Guardar y Continuar</>}
                        </button>
                    ) : (
                        <div className="readonly-actions">
                            <p className="verified-msg"><FiCheckCircle /> Datos verificados correctamente.</p>
                            {/* Botón opcional para saltar al paso 2 si ya está lleno */}
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