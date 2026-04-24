import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
    FiX, FiMail, FiLock, FiLoader, 
    FiUserPlus, FiLogIn, FiUser 
} from 'react-icons/fi';
import { useAuthActions } from '../../pages/hooks/useAuthActions';
import { StatusModal } from '../Common/StatusModal';
import './AuthModal.css';

export const AuthModal = ({ isOpen, onClose }) => {
    // --- 1. TODOS LOS HOOKS VAN AL PRINCIPIO ---
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ 
        nombre: '', 
        email: '', 
        password: '' 
    });

    // Importante: Asegúrate que useAuthActions siempre devuelva un objeto, no null
    const { handleAuth, loading, status, closeStatus } = useAuthActions(onClose);

    useEffect(() => {
        if (!isOpen) {
            setFormData({ nombre: '', email: '', password: '' });
            setIsLogin(true);
        }
    }, [isOpen]);

    // --- 2. LÓGICA Y MENEJADORES ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const isFormValid = useMemo(() => {
        const { nombre, email, password } = formData;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        // MED-03: Solo para registro exigimos complejidad
        // Login solo requiere que se haya ingresado algo
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        
        const isEmailValid = emailRegex.test(email);
        const isPasswordValid = isLogin ? password.length > 0 : passwordRegex.test(password);
        const isNameValid = isLogin ? true : nombre.trim().length >= 3;

        return isEmailValid && isPasswordValid && isNameValid;
    }, [formData, isLogin]);

    const handleSubmit = async (e) => { // Agregar async
    if (e) e.preventDefault();
    if (!isFormValid || loading) return;

    // Ejecutamos y esperamos el resultado
    const success = await handleAuth(isLogin, formData);
    
    // Solo cerramos si fue exitoso
    if (success) {
        onClose(); 
    }
};

    const toggleMode = (mode) => {
        if (loading) return; 
        setIsLogin(mode);
        setFormData({ nombre: '', email: '', password: '' });
    };

    // --- 3. RETORNOS CONDICIONALES (SIEMPRE DESPUÉS DE LOS HOOKS) ---
    
    // Aquí usamos encadenamiento opcional (?.) para evitar el error de "reading open of null"
    if (!isOpen && !status?.open) return null;

    return ReactDOM.createPortal(
        <>
            <div className={`modal-overlay ${isOpen ? 'show' : ''}`} onClick={!loading ? onClose : null}>
                <div className="modal-content animate-pop" onClick={(e) => e.stopPropagation()}>
                    
                    <button className="close-btn" onClick={onClose} disabled={loading}>
                        <FiX />
                    </button>

                    <header className="modal-header">
                        <h2>{isLogin ? 'Bienvenido de nuevo' : 'Únete a CrediGo'}</h2>
                        <p>{isLogin ? 'Ingresa tus credenciales' : 'Crea tu cuenta'}</p>
                    </header>

                    <div className="auth-toggle-container">
                        <button 
                            className={`toggle-tab ${isLogin ? 'active' : ''}`} 
                            onClick={() => toggleMode(true)}
                        > Iniciar Sesión </button>
                        <button 
                            className={`toggle-tab ${!isLogin ? 'active' : ''}`} 
                            onClick={() => toggleMode(false)}
                        > Registro </button>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {!isLogin && (
                            <div className="input-group">
                                <FiUser className="input-icon" />
                                <input name="nombre" type="text" placeholder="Nombre" value={formData.nombre} onChange={handleChange} disabled={loading} />
                            </div>
                        )}
                        <div className="input-group">
                            <FiMail className="input-icon" />
                            <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} disabled={loading} />
                        </div>
                        <div className="input-group">
                            <FiLock className="input-icon" />
                            <input 
                                name="password" 
                                type="password" 
                                placeholder={isLogin ? "Contraseña" : "Contraseña (8+ car., 1 mayúscula, 1 número)"} 
                                value={formData.password} 
                                onChange={handleChange} 
                                disabled={loading} 
                                autoComplete={isLogin ? "current-password" : "new-password"}
                            />
                        </div>

                        <button type="submit" className={`auth-submit-btn ${loading ? 'loading' : ''}`} disabled={loading || !isFormValid}>
                            {loading ? <FiLoader className="spinner" /> : (isLogin ? 'Entrar' : 'Crear Cuenta')}
                        </button>
                    </form>
                </div>
            </div>

            {/* Renderizado seguro del StatusModal */}
            {status?.open && (
                <StatusModal 
                    isOpen={status.open} 
                    type={status.type} 
                    message={status.message} 
                    onClose={closeStatus} 
                />
            )}
        </>,
        document.body
    );
};