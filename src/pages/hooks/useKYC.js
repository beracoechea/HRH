/* src/pages/hooks/useKYC.js
 *
 * REFACTORIZADO — La lógica de negocio vive en el backend.
 *
 * CAMBIOS:
 * ─ Elimina escritura directa a Firestore (setDoc/updateDoc).
 * ─ Delega a completarKYC (Cloud Function) que maneja:
 *    a) Guardado en perfil/kyc
 *    b) Denormalización en documento principal
 *    c) Avance automático a FASE 3 en el crédito
 */
import { useState } from 'react';
import { completarKYC } from '../../api/kycApi';

export const useKYC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Guarda los datos KYC y avanza la fase del crédito.
     * @param {string} userId    - UID del usuario
     * @param {string} creditoId - ID del crédito asociado
     * @param {Object} formData  - Datos capturados
     */
    const saveKYC = async (userId, creditoId, formData) => {
        setLoading(true);
        setError(null);

        try {
            // Delegar toda la lógica al backend
            const result = await completarKYC(userId, creditoId, formData);

            if (result.success) {
                setLoading(false);
                return { success: true };
            } else {
                throw new Error(result.error || 'Error desconocido en el servidor');
            }

        } catch (err) {
            console.error("Error en useKYC:", err);
            setError("No se pudieron guardar los datos. Inténtalo más tarde.");
            setLoading(false);
            return { success: false, error: err.message };
        }
    };

    return { saveKYC, loading, error };
};