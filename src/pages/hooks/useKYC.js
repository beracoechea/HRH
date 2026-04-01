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
            // 1. Guardar en la subcolección perfil/kyc (fuente de verdad)
            const userKycRef = doc(db, "usuarios", userId, "perfil", "kyc");
            await setDoc(userKycRef, {
                ...formData,
                updatedAt: serverTimestamp()
            }, { merge: true });

            // 2. DENORMALIZAR en el documento principal para que el admin lo vea sin
            //    necesidad de hacer lecturas adicionales de la subcolección.
            const mainUserRef = doc(db, "usuarios", userId);
            await updateDoc(mainUserRef, {
                kyc: formData,
                // También guardamos el teléfono a nivel raíz para acceso rápido
                telefono: formData.telefono || '',
                nombre: formData.nombreCompleto || '',
                updatedAt: serverTimestamp()
            });

            // 3. Actualizar el crédito específico para avanzar a la FASE 3
            if (creditoId) {
                const creditoRef = doc(db, "creditos", creditoId);
                await updateDoc(creditoRef, {
                    fase: 3,
                    datosKYC: formData,
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