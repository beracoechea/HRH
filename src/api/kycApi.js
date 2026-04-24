/**
 * src/api/kycApi.js
 * 
 * Capa de API para el proceso de KYC.
 */
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

/**
 * Completa el proceso de KYC de un usuario.
 * @param {string} userId    - UID del usuario
 * @param {string} creditoId - ID del crédito asociado
 * @param {Object} formData  - Datos del formulario KYC
 */
export const completarKYC = async (userId, creditoId, formData) => {
    const fn = httpsCallable(functions, 'completarKYC');
    const result = await fn({ userId, creditoId, formData });
    return result.data;
};
