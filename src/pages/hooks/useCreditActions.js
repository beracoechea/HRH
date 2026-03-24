/* src/pages/hooks/useCreditActions.js */
import { useState } from 'react';
import { db } from '../../firebase/config';
import { doc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { CreditService } from '../../service/CreditService';

const creditService = new CreditService();

export const useCreditActions = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ open: false, type: 'info', message: '' });

    const closeStatus = () => setStatus({ ...status, open: false });

    /**
     * Actualiza las condiciones financieras de un crédito (Monto, Plazo, Pagos)
     * @param {Object} data - Objeto con ID y campos a actualizar
     */
    const updateCreditConditions = async (data) => {
        const { creditoId, id, nuevoMonto, nuevoPlazo, pagoQ1, pagoQ2, totalEstimado } = data;
        const targetId = creditoId || id;
        
        if (!targetId) {
            setStatus({ open: true, type: 'error', message: "ID de crédito no encontrado." });
            return { success: false };
        }

        setLoading(true);
        try {
            const creditRef = doc(db, "creditos", targetId);

            const updateData = {
                updatedAt: serverTimestamp(),
                monto_solicitado: Number(nuevoMonto),
                plazo_meses: Number(nuevoPlazo),
                pago_quincenal_ano1: Number(pagoQ1),
                pago_quincenal_ano2: Number(pagoQ2),
                total_estimado: Number(totalEstimado),
                tasaMensual: Number(tasaMensual)
            };

            await updateDoc(creditRef, updateData);

            setStatus({ 
                open: true, 
                type: 'success', 
                message: "Condiciones actualizadas exitosamente." 
            });

            return { success: true };
        } catch (error) {
            console.error("Error al actualizar crédito:", error);
            setStatus({ 
                open: true, 
                type: 'error', 
                message: "Error al guardar: " + error.message 
            });
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Cambia el estado general de un crédito (Aprobar/Rechazar)
     */
    const updateCreditStatus = async (id, newStatus) => {
        setLoading(true);
        try {
            await creditService.updateStatus(id, { estado: newStatus });
            setStatus({ open: true, type: 'success', message: `Crédito ${newStatus} correctamente.` });
            return { success: true };
        } catch (error) {
            setStatus({ open: true, type: 'error', message: error.message });
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Registra un nuevo abono al crédito
     */
    const registerPayment = async (id, amount, adminId) => {
        setLoading(true);
        try {
            await creditService.updateStatus(id, { 
                montoAbono: Number(amount),
                adminId: adminId || 'admin'
            });
            setStatus({ open: true, type: 'success', message: "Abono registrado exitosamente." });
            return { success: true };
        } catch (error) {
            setStatus({ open: true, type: 'error', message: "Error al registrar abono: " + error.message });
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Corrige el total pagado (sobrescribe)
     */
    const correctTotalPaid = async (id, newTotal, adminId) => {
        setLoading(true);
        try {
            await creditService.updateStatus(id, { 
                montoTotalCorregido: Number(newTotal),
                adminId: adminId || 'admin'
            });
            setStatus({ open: true, type: 'success', message: "Total corregido exitosamente." });
            return { success: true };
        } catch (error) {
            setStatus({ open: true, type: 'error', message: "Error al corregir total: " + error.message });
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    return {
        updateCreditConditions,
        updateCreditStatus,
        registerPayment,
        correctTotalPaid,
        loading,
        status,
        closeStatus
    };
};