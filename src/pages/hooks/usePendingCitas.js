import { useState } from 'react';
import { AppointmentService } from '../../service/AppointmentService';

const appointmentService = new AppointmentService();

export const usePendingCitas = (onActionComplete) => {
    const [processingId, setProcessingId] = useState(null);

    const handleAction = async (citaId, accion) => {
        setProcessingId(citaId);
        try {
            const nuevoEstado = accion === 'confirmar' ? 'confirmada' : 'rechazada';
            
            await appointmentService.actualizarEstadoCita(citaId, nuevoEstado);
            
            // Notificar al componente padre para refrescar la lista
            if (onActionComplete) onActionComplete();
            
        } catch (error) {
            console.error("Error al procesar cita:", error);
            alert("No se pudo actualizar la cita.");
        } finally {
            setProcessingId(null);
        }
    };

    return {
        handleAction,
        processingId
    };
};