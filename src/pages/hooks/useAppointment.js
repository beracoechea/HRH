// src/hooks/useAppointment.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppointmentService } from '../../service/AppointmentService';
import { useFirestoreOperation } from './core/useFirestoreOperation';

const appointmentService = new AppointmentService();

export const useAppointment = (onClose) => {
    const { user } = useAuth();
    const { loading, status, setStatus, execute } = useFirestoreOperation();

    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        fecha: '',
        horario: ''
    });

    // Sincronizar datos si el usuario está logueado
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                nombre: user.nombre || user.displayName || '',
                email: user.email || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

       await execute(async () => {
        const appointmentData = {
            ...formData,
            user_id: user?.uid || null,
            user_email: user?.email || 'Invitado',
            estatus: 'pendiente', // <--- IMPORTANTE
            createdAt: new Date()
        };

            await appointmentService.crearCita(appointmentData);

            // Éxito: Esperar un poco y cerrar modal
            setTimeout(() => {
                if (onClose) onClose();
            }, 2000);

            return "¡Cita agendada con éxito! Revisaremos la disponibilidad.";
        });
    };
    

    return {
        formData,
        loading,
        status,
        setStatus,
        handleChange,
        handleSubmit,
        isAuthenticated: !!user
    };
};