/**
 * src/api/authApi.js
 *
 * Capa de API para operaciones de autenticación.
 * El frontend NUNCA llama a Firebase directamente para operaciones privilegiadas.
 * Solo se usa Firebase Auth SDK para crear la sesión; el resto va por Cloud Functions.
 */
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

/**
 * Completa el registro de un usuario en Firestore y asigna Custom Claims.
 * Llama a la Cloud Function `registrarUsuario` en el backend.
 *
 * @param {Object} data
 * @param {string} data.nombre - Nombre del usuario
 * @param {string} data.email  - Email del usuario
 * @returns {Promise<{ success: boolean, uid: string }>}
 */
export const registrarUsuario = async (data) => {
    const fn = httpsCallable(functions, 'registrarUsuario');
    const result = await fn(data);
    return result.data;
};
