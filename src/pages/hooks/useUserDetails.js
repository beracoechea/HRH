import { useState, useCallback } from 'react';
import { db } from '../../firebase/config';
import { 
  collection, query, where, getDocs, 
  updateDoc, doc, orderBy 
} from 'firebase/firestore';

export const useUserDetails = (userId) => {
    const [details, setDetails] = useState({ citas: [], creditos: [] });
    const [loading, setLoading] = useState(false);
    const [actionId, setActionId] = useState(null);

    const fetchDetails = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            // 1. Consulta de Citas (Usa user_id según tu AppointmentService)
            const citasQuery = query(
                collection(db, "citas"),
                where("user_id", "==", userId),
                orderBy("createdAt", "desc") 
            );

            // 2. Consulta de Créditos (Usa usuario_id según tu CreditService)
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
            // IMPORTANTE: Si ves un error en consola, haz clic en el link para crear el INDEX
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const confirmarCita = async (citaId) => {
        setActionId(citaId);
        try {
            const citaRef = doc(db, "citas", citaId);
            await updateDoc(citaRef, { 
                estatus: 'confirmada',
                updatedAt: new Date() 
            });
            setDetails(prev => ({
                ...prev,
                citas: prev.citas.map(c => c.id === citaId ? { ...c, estatus: 'confirmada' } : c)
            }));
            return { success: true, message: "Cita confirmada." };
        } catch (error) {
            return { success: false, message: "Error al confirmar." };
        } finally { setActionId(null); }
    };

    const rechazarCita = async (citaId) => {
        setActionId(citaId);
        try {
            const citaRef = doc(db, "citas", citaId);
            await updateDoc(citaRef, { 
                estatus: 'rechazada',
                updatedAt: new Date() 
            });
            setDetails(prev => ({
                ...prev,
                citas: prev.citas.map(c => c.id === citaId ? { ...c, estatus: 'rechazada' } : c)
            }));
            return { success: true, message: "Cita rechazada." };
        } catch (error) {
            return { success: false, message: "Error al rechazar." };
        } finally { setActionId(null); }
    };

    return { details, loading, actionId, fetchDetails, confirmarCita, rechazarCita };
};