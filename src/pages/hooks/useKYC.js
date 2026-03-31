import { useState } from 'react';
import { db } from '../../firebase/config';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export const useKYC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const saveKYC = async (userId, creditoId, formData) => {
        setLoading(true);
        setError(null);

        try {
            // 1. Guardar o actualizar los datos en el perfil del usuario (Colección Permanente)
            // Esto permite que si el usuario entra a otra solicitud mañana, sus datos ya estén ahí.
            const userKycRef = doc(db, "usuarios", userId, "perfil", "kyc");
            await setDoc(userKycRef, {
                ...formData,
                updatedAt: serverTimestamp()
            }, { merge: true });

            // 2. Actualizar el crédito específico para avanzar a la FASE 2
            if (creditoId) {
                const creditoRef = doc(db, "creditos", creditoId);
                await updateDoc(creditoRef, {
                    fase: 2, // <--- ESTO ES LO QUE MUEVE EL STEPPER
                    datosKYC: formData, // Guardamos una copia en el crédito por auditoría
                    statusKYC: 'completado',
                    lastUpdate: serverTimestamp()
                });
            }

            setLoading(false);
            return { success: true };

        } catch (err) {
            console.error("Error en useKYC:", err);
            setError("No se pudieron guardar los datos. Revisa tus permisos.");
            setLoading(false);
            return { success: false, error: err.message };
        }
    };

    return { saveKYC, loading, error };
};