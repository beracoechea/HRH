import { useState, useEffect, useCallback } from 'react';
import { AppointmentService } from '../../service/AppointmentService';
import { CreditService } from '../../service/CreditService';
import { useFirestoreOperation } from './core/useFirestoreOperation';

const appointmentService = new AppointmentService();
const creditService = new CreditService();

export const usePerfil = (user) => {
    const [perfilData, setPerfilData] = useState({ citas: [], creditos: [] });
    const { loading, error, execute } = useFirestoreOperation();
    const userId = user?.uid || user?.id;

    const fetchAllData = useCallback(async () => {
        if (!userId) return;

        await execute(async () => {
            // Ejecución paralela para evitar bloqueos
            const [citas, creditos] = await Promise.all([
                appointmentService.getByUsuario(userId),
                creditService.getByUsuario(userId)
            ]);

            setPerfilData({ 
                citas: citas || [], 
                creditos: creditos || [] 
            });
            
            return "Perfil sincronizado";
        });
    }, [userId]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    return {
        data: perfilData,
        loading,
        error,
        refreshData: fetchAllData
    };
};