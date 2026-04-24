/* src/pages/hooks/useAuthActions.js
 *
 * Hook de acciones de autenticación REFACTORIZADO.
 *
 * CAMBIOS vs versión anterior:
 * ─ ELIMINADO: escritura directa de rol/grupo en Firestore desde el cliente.
 * ─ ELIMINADO: imports de db, setDoc, updateDoc.
 * ─ AÑADIDO: registro completa el flujo en dos pasos:
 *     1. Firebase Auth SDK crea la sesión (solo puede hacerlo el cliente)
 *     2. Cloud Function `registrarUsuario` crea el doc + Custom Claims
 *
 * El campo 'rol' NUNCA es escrito por el frontend.
 */
import { useState } from 'react';
import { auth } from '../../firebase/config';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
} from 'firebase/auth';
import { registrarUsuario } from '../../api/authApi';

export const useAuthActions = (onUpdate) => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ open: false, type: '', message: '' });

    // ── Mapeo de errores de Firebase a mensajes amigables (MED-01) ──────────
    const _mapAuthError = (error) => {
        const codes = {
            'auth/user-not-found': 'El correo electrónico no está registrado.',
            'auth/wrong-password': 'Contraseña incorrecta. Intenta de nuevo.',
            'auth/invalid-credential': 'Correo o contraseña incorrectos.',
            'auth/email-already-in-use': 'Este correo ya tiene una cuenta registrada.',
            'auth/weak-password': 'La contraseña es muy débil. Usa al menos 8 caracteres.',
            'auth/invalid-email': 'El formato del correo electrónico no es válido.',
            'auth/too-many-requests': 'Demasiados intentos fallidos. Espera un momento.',
            'auth/network-request-failed': 'Error de conexión. Verifica tu internet.',
            'no-profile': 'Tu cuenta no tiene un perfil configurado. Contacta a soporte.',
        };
        return codes[error.code] || 'Ocurrió un error inesperado. Por favor intenta de nuevo.';
    };

    // ── Login ───────────────────────────────────────────────────────────────
    const handleLogin = async (email, password) => {
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // El AuthContext se encarga de leer los Custom Claims del token
            return true;
        } catch (error) {
            setStatus({ open: true, type: 'error', message: _mapAuthError(error) });
            return false;
        } finally {
            setLoading(false);
        }
    };

    // ── Registro de nuevo usuario ────────────────────────────────────────────
    // Paso 1: Firebase Auth crea la sesión (solo posible desde el cliente)
    // Paso 2: Cloud Function registra el documento y asigna Claims
    const handleRegister = async (formData) => {
        setLoading(true);
        try {
            // 1. Crear credenciales en Firebase Auth
            const { user } = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            // 2. Actualizar displayName en Auth (UI/UX)
            await updateProfile(user, { displayName: formData.nombre });

            // 3. Delegar al backend: crea el documento + Custom Claims 'cliente'
            await registrarUsuario({ nombre: formData.nombre, email: formData.email });

            // 4. Forzar refresh del token para que el AuthContext reciba los Claims
            await user.getIdToken(true);

            return true;
        } catch (error) {
            setStatus({ open: true, type: 'error', message: _mapAuthError(error) });
            return false;
        } finally {
            setLoading(false);
        }
    };

    // ── Wrapper unificado (compatibilidad con <AuthModal />) ─────────────────
    const handleAuth = async (isLogin, formData) => {
        if (isLogin) {
            return handleLogin(formData.email, formData.password);
        }
        return handleRegister(formData);
    };

    return {
        handleAuth,
        handleLogin,
        handleRegister,
        loading,
        status,
        closeStatus: () => setStatus({ ...status, open: false }),
    };
};