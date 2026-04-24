/**
 * src/api/appointmentApi.js
 * 
 * Capa de API para la gestión de citas.
 */
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

/**
 * Confirma una cita.
 */
export const confirmarCita = async (citaId) => {
    const fn = httpsCallable(functions, 'confirmarCita');
    const result = await fn({ citaId });
    return result.data;
};

/**
 * Rechaza una cita.
 */
export const rechazarCita = async (citaId) => {
    const fn = httpsCallable(functions, 'rechazarCita');
    const result = await fn({ citaId });
    return result.data;
};
