/* src/pages/hooks/useCreditActions.js */
import { useState } from 'react';
import { db } from '../../firebase/config';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export const useCreditActions = () => {
    const [loading, setLoading] = useState(false);

    /**
     * Actualiza las condiciones financieras de un crédito (Monto, Plazo, Pagos)
     * @param {Object} data - Objeto con ID y campos a actualizar
     */
    const updateCreditConditions = async (data) => {
        const { id, ...campos } = data;
        
        if (!id) throw new Error("ID de crédito no proporcionado.");

        setLoading(true);
        try {
            const creditRef = doc(db, "creditos", id);

            // Actualizamos en Firestore
            await updateDoc(creditRef, {
                ...campos,
                updatedAt: serverTimestamp(), // Auditoría de cambio
                // Aseguramos que los valores sean números antes de guardar
                monto_solicitado: Number(campos.monto_solicitado),
                plazo_meses: Number(campos.plazo_meses)
            });

            return { success: true };
        } catch (error) {
            console.error("Error al actualizar crédito:", error);
            return { 
                success: false, 
                message: "No se pudieron guardar los cambios. Revisa tu conexión." 
            };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Cambia el estado general de un crédito (Aprobar/Rechazar)
     */
    const updateCreditStatus = async (id, newStatus) => {
        setLoading(true);
        try {
            const creditRef = doc(db, "creditos", id);
            await updateDoc(creditRef, {
                estado: newStatus,
                fecha_actualizacion: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    };

    return {
        updateCreditConditions,
        updateCreditStatus,
        loading
    };
};