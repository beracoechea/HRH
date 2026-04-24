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
        motivo: '',
        fecha: '',
        horario: ''
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                nombre: user.nombre || '',
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
                user_id: user?.uid, // Se mapeará a usuario_id en el servicio
                user_email: user?.email,
                grupo: user?.grupo || '', // Para filtrado de citas
                usuario_grupo: user?.grupo || '' // Redundancia para filtros de créditos/usuarios
            };

            await appointmentService.crearCita(appointmentData);

            setTimeout(() => { if (onClose) onClose(); }, 2000);
            return "¡Cita solicitada con éxito!";
        });
    };

    return { formData, loading, status, handleChange, handleSubmit, isAuthenticated: !!user };
};