/* src/pages/hooks/useUserDetails.js
 *
 * REFACTORIZADO — Gestión de citas por backend.
 */
import { useState, useCallback } from 'react';
import { db } from '../../firebase/config';
import { 
  collection, query, where, getDocs, orderBy 
} from 'firebase/firestore';
import { confirmarCita, rechazarCita } from '../../api/appointmentApi';

export const useUserDetails = (userId) => {
    const [details, setDetails] = useState({ citas: [], creditos: [] });
    const [loading, setLoading] = useState(false);
    const [actionId, setActionId] = useState(null);

    const fetchDetails = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const citasQuery = query(
                collection(db, "citas"),
                where("user_id", "==", userId),
                orderBy("createdAt", "desc") 
            );

            const creditosQuery = query(
                collection(db, "creditos"),
                where("usuario_id", "==", userId),
                orderBy("createdAt", "desc")
            );

            const [citasSnap, creditosSnap] = await Promise.all([
                getDocs(citasQuery),
                getDocs(creditosQuery)
            ]);

            setDetails({
                citas: citasSnap.docs.map(d => ({ id: d.id, ...d.data() })),
                creditos: creditosSnap.docs.map(d => ({ id: d.id, ...d.data() }))
            });
        } catch (error) {
            console.error("Error en fetchDetails:", error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const handleConfirmarCita = async (citaId) => {
        setActionId(citaId);
        try {
            await confirmarCita(citaId);
            setDetails(prev => ({
                ...prev,
                citas: prev.citas.map(c => c.id === citaId ? { ...c, estatus: 'confirmada' } : c)
            }));
            return { success: true, message: "Cita confirmada." };
        } catch (error) {
            return { success: false, message: "Error al confirmar: " + error.message };
        } finally { setActionId(null); }
    };

    const handleRechazarCita = async (citaId) => {
        setActionId(citaId);
        try {
            await rechazarCita(citaId);
            setDetails(prev => ({
                ...prev,
                citas: prev.citas.map(c => c.id === citaId ? { ...c, estatus: 'rechazada' } : c)
            }));
            return { success: true, message: "Cita rechazada." };
        } catch (error) {
            return { success: false, message: "Error al rechazar: " + error.message };
        } finally { setActionId(null); }
    };

    return { 
        details, 
        loading, 
        actionId, 
        fetchDetails, 
        confirmarCita: handleConfirmarCita, 
        rechazarCita: handleRechazarCita 
    };
};