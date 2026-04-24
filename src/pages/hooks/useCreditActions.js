/* src/pages/hooks/useCreditActions.js
 *
 * REFACTORIZADO — Operaciones privilegiadas van por Cloud Functions.
 *
 * CAMBIOS:
 * ─ updateCreditStatus → ahora llama actualizarEstadoCredito (CF)
 * ─ registerPayment    → ahora llama registrarPago (CF)
 * ─ correctTotalPaid   → sigue en CreditService (corrección admin directa)
 * ─ updateCreditConditions → sigue directo (datos financieros no críticos)
 *
 * CONSERVADO con escritura directa a Firestore:
 * ─ Condiciones financieras (monto, plazo, tasas) — campos no protegidos
 * ─ Corrección de total pagado — operación de solo admin/tesorero
 */
import { useState } from 'react';
import { db } from '../../firebase/config';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { CreditService } from '../../service/CreditService';
import { registrarPago, actualizarEstadoCredito } from '../../api/creditApi';

const creditService = new CreditService();

export const useCreditActions = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ open: false, type: 'info', message: '' });

    const closeStatus = () => setStatus({ ...status, open: false });

    // ── Condiciones financieras (escritura directa — campos no críticos) ────
    const updateCreditConditions = async (data) => {
        const { creditoId, id, nuevoMonto, nuevoPlazo, pagoQ1, pagoQ2, totalEstimado, tasaMensual } = data;
        const targetId = creditoId || id;

        if (!targetId) {
            setStatus({ open: true, type: 'error', message: 'ID de crédito no encontrado.' });
            return { success: false };
        }

        setLoading(true);
        try {
            const creditRef = doc(db, 'creditos', targetId);
            await updateDoc(creditRef, {
                updatedAt: serverTimestamp(),
                monto_solicitado: Number(nuevoMonto),
                plazo_meses: Number(nuevoPlazo),
                pago_quincenal_ano1: Number(pagoQ1),
                pago_quincenal_ano2: Number(pagoQ2),
                total_estimado: Number(totalEstimado),
                tasaMensual: Number(tasaMensual),
            });

            setStatus({ open: true, type: 'success', message: 'Condiciones actualizadas exitosamente.' });
            return { success: true };

        } catch (error) {
            console.error('Error al actualizar crédito:', error);
            setStatus({ open: true, type: 'error', message: 'Error al guardar: ' + error.message });
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    // ── Cambio de estado del crédito → Cloud Function ──────────────────────
    const updateCreditStatus = async (id, newStatus) => {
        setLoading(true);
        try {
            await actualizarEstadoCredito(id, newStatus);
            setStatus({ open: true, type: 'success', message: `Crédito ${newStatus} correctamente.` });
            return { success: true };
        } catch (error) {
            console.error('Error updateCreditStatus:', error);
            setStatus({ open: true, type: 'error', message: error.message });
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    };

    // ── Registro de abono → Cloud Function ─────────────────────────────────
    const registerPayment = async (id, amount) => {
        setLoading(true);
        try {
            await registrarPago(id, Number(amount));
            setStatus({ open: true, type: 'success', message: 'Abono registrado exitosamente.' });
            return { success: true };
        } catch (error) {
            console.error('Error registerPayment:', error);
            setStatus({ open: true, type: 'error', message: 'Error al registrar abono: ' + error.message });
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    // ── Corrección de total pagado (admin directo — solo ajuste contable) ──
    const correctTotalPaid = async (id, newTotal, adminId) => {
        setLoading(true);
        try {
            await creditService.updateStatus(id, {
                montoTotalCorregido: Number(newTotal),
                adminId: adminId || 'admin',
            });
            setStatus({ open: true, type: 'success', message: 'Total corregido exitosamente.' });
            return { success: true };
        } catch (error) {
            setStatus({ open: true, type: 'error', message: 'Error al corregir total: ' + error.message });
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
        closeStatus,
    };
};