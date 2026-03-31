import { useState } from 'react';
import { AppointmentService } from '../../service/AppointmentService';

const appointmentService = new AppointmentService();

export const usePendingCitas = (onActionComplete) => {
    const [processingId, setProcessingId] = useState(null);

    const handleAction = async (citaId, accionOEstado) => {
        setProcessingId(citaId);
        try {
            // Mapeo flexible: Si viene de un botón es 'confirmar/rechazar', 
            // si viene del select es el estado directo.
            let nuevoEstado = accionOEstado;
            if (accionOEstado === 'confirmar') nuevoEstado = 'confirmada';
            if (accionOEstado === 'rechazar') nuevoEstado = 'rechazada';
            
            await appointmentService.actualizarEstadoCita(citaId, nuevoEstado);
            
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