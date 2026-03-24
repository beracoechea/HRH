import { useState, useEffect, useCallback } from 'react';
import { AppointmentService } from '../../service/AppointmentService';
import { CreditService } from '../../service/CreditService';
import { useFirestoreOperation } from './core/useFirestoreOperation';

const appointmentService = new AppointmentService();
const creditService = new CreditService();

export const usePerfil = (user) => {
    const [activeTab, setActiveTab] = useState('citas');
    const [perfilData, setPerfilData] = useState({ citas: [], creditos: [] });
    const { loading, error, execute } = useFirestoreOperation();

    // Extraemos el ID sin importar si viene como 'uid' o 'id'
    const userId = user?.uid || user?.id;

    const fetchAllData = useCallback(async () => {
        if (!userId) return;

        await execute(async () => {
            // Ejecución en paralelo para mayor velocidad
            const [citas, creditos] = await Promise.all([
                appointmentService.getByUsuario(userId),
                creditService.getByUsuario(userId)
            ]);

            setPerfilData({ 
                citas: citas || [], 
                creditos: creditos || [] 
            });
            
            return "Datos de perfil cargados";
        });
    }, [userId, execute]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    return {
        activeTab,
        setActiveTab,
        data: perfilData,
        loading,
        error,
        refreshData: fetchAllData
    };
};