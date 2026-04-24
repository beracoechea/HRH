// src/service/AuthService.js
//
// REFACTORIZADO: Esta clase solo maneja el flujo de Auth SDK del cliente.
// ──────────────────────────────────────────────────────────────────────
// ✅ PERMITIDO aquí: login, logout (operaciones de sesión de Firebase Auth)
// ❌ ELIMINADO:      updateUserRoleInDB  → usar adminApi.asignarRolUsuario
// ❌ ELIMINADO:      register con setDoc → usar useAuthActions.handleRegister
//
// La creación del documento de usuario y la asignación de Custom Claims
// se delegan a la Cloud Function `registrarUsuario` vía authApi.js.

import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

export class AuthService {
    /**
     * Inicia sesión con email y contraseña.
     * @param {string} email
     * @param {string} password
     */
    async login(email, password) {
        try {
            return await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            throw this._mapAuthError(error);
        }
    }

    /**
     * Cierra la sesión del usuario actual.
     */
    async logout() {
        return await signOut(auth);
    }

    /**
     * Mapea códigos de error de Firebase a mensajes amigables (MED-01).
     * @param {Error} error
     */
    _mapAuthError(error) {
        const codes = {
            'auth/user-not-found': 'El correo no está registrado.',
            'auth/wrong-password': 'Contraseña incorrecta.',
            'auth/invalid-credential': 'Correo o contraseña incorrectos.',
            'auth/email-already-in-use': 'Este correo ya tiene una cuenta.',
            'auth/weak-password': 'La contraseña es muy débil.',
            'auth/invalid-email': 'Formato de correo inválido.',
            'auth/too-many-requests': 'Demasiados intentos. Espera un momento.',
        };
        return new Error(codes[error.code] || 'Error en la autenticación.');
    }

    // NOTA: updateUserRoleInDB fue ELIMINADO.
    // Para asignar roles usar: import { asignarRolUsuario } from '../api/adminApi';

    // NOTA: register con setDoc fue ELIMINADO.
    // Para registrar usar: useAuthActions.handleRegister (que llama a authApi)
}