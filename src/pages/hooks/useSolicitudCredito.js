import { useState, useEffect } from 'react';
import { CreditService } from '../../service/CreditService';
import { useFirestoreOperation } from './core/useFirestoreOperation';

const creditService = new CreditService();

export const useSolicitudCredito = (user, datosPrestamo, onSuccess) => {
    // Hook personalizado para manejar estados de carga y errores de Firestore
    const { loading, status, setStatus, execute } = useFirestoreOperation();
    
    // Estado inicial del formulario incluyendo los acuerdos legales
    const [formData, setFormData] = useState({
        nombre: user?.nombre || user?.displayName || '',
        correo: user?.email || '',
        telefono: '',
        aceptaTerminos: false, // Controla el primer checkbox
        autorizaBuro: false    // Controla el segundo checkbox
    });

    // Efecto para sincronizar el nombre y correo si el usuario se loguea tarde
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                nombre: user.nombre || user.displayName || prev.nombre,
                correo: user.email || prev.correo
            }));
        }
    }, [user]);

    /**
     * Validación en tiempo real. 
     * El botón de envío se habilitará solo si todo esto es true.
     */
    const isFormValid = 
        formData.nombre.trim().length > 3 && 
        formData.correo.includes('@') && 
        formData.telefono.length === 10 &&
        formData.aceptaTerminos === true && 
        formData.autorizaBuro === true;

    /**
     * Manejador de cambios universal
     * Corrige el error de los checkboxes que no se podian desmarcar
     */
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        setFormData(prev => ({ 
            ...prev, 
            // Si es un checkbox, guardamos el booleano 'checked', de lo contrario el string 'value'
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    /**
     * Envío de la solicitud al CreditService
     */
   const sendSolicitud = async (e) => {
    if (e) e.preventDefault();
    
    if (!isFormValid) {
        setStatus({
            open: true,
            type: 'error',
            message: 'Por favor, completa todos los campos y acepta los acuerdos.'
        });
        return;
    }

    await execute(async () => {
        // --- NUEVA LÓGICA DE MAPEO ---
        // Extraemos los valores numéricos de datosPrestamo para asegurar que no vayan vacíos
        const payloadFinanciero = {
            monto_solicitado: datosPrestamo.montoReal || 0, // Necesitaremos pasar el valor numérico
            pago_quincenal_ano1: datosPrestamo.cuotaQuincenal1 || 0,
            pago_quincenal_ano2: datosPrestamo.cuotaQuincenal2 || 0,
            plazo_meses: datosPrestamo.plazoMeses || 0,
            total_estimado: datosPrestamo.totalPagar || 0,
            frecuencia_pago: "quincenal",
            tipo_credito: datosPrestamo.tipoLabel || "PERSONAL"
        };

        // Enviamos el objeto mapeado en lugar de datosPrestamo directamente
        await creditService.crearSolicitud(
            { ...user, nombre: formData.nombre }, 
            payloadFinanciero, // <--- Usar el nuevo objeto mapeado
            formData.telefono
        );
        
        setTimeout(() => {
            if (onSuccess) onSuccess();
        }, 2000);
        
        return "¡Solicitud enviada! Nuestro equipo revisará tu documentación en breve.";
    });
};
    const closeStatus = () => setStatus(prev => ({ ...prev, open: false }));

    return {
        formData,
        loading,
        status,
        isFormValid,
        handleInputChange,
        sendSolicitud,
        closeStatus
    };
};