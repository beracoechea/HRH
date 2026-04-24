/* src/pages/hooks/useAdminUserActions.js
 *
 * REFACTORIZADO:
 * ─ Las operaciones de bloqueo/reactivación/eliminación de usuarios ahora
 *   van por Cloud Functions vía adminApi.js (no escritura directa a Firestore).
 * ─ La asignación de rol/grupo ahora va por adminApi.asignarRolUsuario.
 * ─ Se conserva: uploadUserDoc, updateUserKYC, updateUserPhase (subida de
 *   archivos y datos no críticos que sí puede hacer el staff directamente).
 */
import { useState } from 'react';
import { db, storage } from '../../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { CREDIT_STEPS } from '../../constants/creditSteps';

// Importar la capa API para operaciones privilegiadas de usuario
import {
    asignarRolUsuario,
    bloquearUsuario,
    reactivarUsuario,
    eliminarUsuario,
} from '../../api/adminApi';

// Importar la capa API para operaciones privilegiadas de crédito
import { actualizarFaseCredito } from '../../api/creditApi';

export const useAdminUserActions = (onUpdate) => {
    const [uploading, setUploading] = useState(false);
    const [actionStatus, setActionStatus] = useState({ open: false, type: '', message: '' });

    // ── Subir documento al expediente ────────────────────────────────────────
    // Esta operación la hace el staff directamente (no requiere Cloud Function)
    const uploadUserDoc = async (userId, file, docName, isSignatureRequest = false, creditId = null) => {
        if (!userId || !file) return;
        setUploading(true);

        try {
            const folder = isSignatureRequest ? 'firmas' : (creditId ? 'creditos' : 'expediente');
            const storagePath = `usuarios/${userId}/${folder}/${Date.now()}_${file.name}`;
            const fileRef = ref(storage, storagePath);
            await uploadBytes(fileRef, file);
            const downloadURL = await getDownloadURL(fileRef);

            const isBuro = docName?.toLowerCase().includes('buró');
            const newDoc = {
                nombre: docName || file.name,
                url: downloadURL,
                estatus: isSignatureRequest ? 'pendiente_firma' : 'aprobado',
                fecha_subida: new Date().toISOString(),
                tipo_documento: isBuro ? 'buro' : (isSignatureRequest ? 'firma_solicitada' : 'extra'),
                storage_path: storagePath,
                requiere_firma: isSignatureRequest,
            };

            const targetRef = creditId
                ? doc(db, 'creditos', creditId)
                : doc(db, 'usuarios', userId);

            await updateDoc(targetRef, {
                expediente: arrayUnion(newDoc),
                updatedAt: serverTimestamp(),
            });

            setActionStatus({
                open: true,
                type: 'success',
                message: isSignatureRequest
                    ? 'Solicitud de firma enviada correctamente.'
                    : 'Archivo añadido al expediente correctamente.',
            });

            if (onUpdate) onUpdate();
            return true;

        } catch (error) {
            console.error('Error uploading user doc:', error);
            setActionStatus({
                open: true,
                type: 'error',
                message: 'Error al procesar el archivo. Inténtalo de nuevo.',
            });
            return false;
        } finally {
            setUploading(false);
        }
    };

    // ── Actualizar datos KYC del usuario ─────────────────────────────────────
    // Staff puede actualizar KYC (campos de perfil, no de rol/status)
    const updateUserKYC = async (userId, kycData, creditId = null) => {
        if (!userId || !kycData) return;
        try {
            const userKycRef = doc(db, 'usuarios', userId, 'perfil', 'kyc');
            await updateDoc(userKycRef, { ...kycData, updatedAt: serverTimestamp() });

            if (creditId) {
                await updateDoc(doc(db, 'creditos', creditId), {
                    datosKYC: kycData,
                    updatedAt: serverTimestamp(),
                });
            }

            const mainUserRef = doc(db, 'usuarios', userId);
            await updateDoc(mainUserRef, {
                kyc: kycData,
                ...(kycData.telefono && { telefono: kycData.telefono }),
                ...(kycData.nombreCompleto && { nombre: kycData.nombreCompleto }),
                ...(kycData.correo && { email: kycData.correo }),
                updatedAt: serverTimestamp(),
            });

            setActionStatus({ open: true, type: 'success', message: 'Información KYC actualizada exitosamente.' });
            if (onUpdate) onUpdate();
            return true;

        } catch (error) {
            console.error('Error updating KYC:', error);
            setActionStatus({ open: true, type: 'error', message: 'Error al actualizar la información KYC.' });
            return false;
        }
    };

    // ── Actualizar fase del crédito (vía Cloud Function) ─────────────────────
    // CAMBIO: ahora delega al backend en lugar de escribir directo a Firestore
    const updateUserPhase = async (creditoId, newPhase) => {
        if (!creditoId) return;
        try {
            await actualizarFaseCredito(creditoId, newPhase);
            if (onUpdate) onUpdate();
            return true;
        } catch (error) {
            console.error('Error updating phase:', error);
            setActionStatus({ open: true, type: 'error', message: 'Error al actualizar la fase del crédito.' });
            return false;
        }
    };

    // ── Gestión de usuarios (todas vía Cloud Function) ───────────────────────

    /**
     * Asigna un nuevo rol y/o grupo a un usuario.
     * @param {string} userId     - UID del usuario
     * @param {string} userEmail  - Email (para el mensaje de confirmación)
     * @param {Object} updates    - { rol, grupo }
     */
    const updateUserAdminData = async (userId, userEmail, updates = {}) => {
        setUploading(true);
        try {
            if (!userId) throw new Error('ID de usuario no proporcionado.');

            await asignarRolUsuario(userId, updates.rol, updates.grupo);

            setActionStatus({
                open: true,
                type: 'success',
                message: `Datos de ${userEmail} actualizados correctamente.`,
            });

            if (onUpdate) await onUpdate();
            return true;

        } catch (error) {
            console.error('Error updating user admin data:', error);
            setActionStatus({
                open: true,
                type: 'error',
                message: `Error: ${error.message || 'No se pudo actualizar la información.'}`,
            });
            return false;
        } finally {
            setUploading(false);
        }
    };

    /**
     * Bloquea el acceso de un usuario a la plataforma.
     * @param {string} userId - UID del usuario
     */
    const handleBloquearUsuario = async (userId) => {
        try {
            await bloquearUsuario(userId);
            setActionStatus({ open: true, type: 'success', message: 'Usuario bloqueado correctamente.' });
            if (onUpdate) onUpdate();
            return true;
        } catch (error) {
            console.error('Error bloqueando usuario:', error);
            setActionStatus({ open: true, type: 'error', message: `Error: ${error.message}` });
            return false;
        }
    };

    /**
     * Reactiva el acceso de un usuario previamente bloqueado.
     * @param {string} userId - UID del usuario
     */
    const handleReactivarUsuario = async (userId) => {
        try {
            await reactivarUsuario(userId);
            setActionStatus({ open: true, type: 'success', message: 'Usuario reactivado correctamente.' });
            if (onUpdate) onUpdate();
            return true;
        } catch (error) {
            console.error('Error reactivando usuario:', error);
            setActionStatus({ open: true, type: 'error', message: `Error: ${error.message}` });
            return false;
        }
    };

    /**
     * Elimina un usuario de la plataforma (borrado lógico).
     * @param {string} userId - UID del usuario
     */
    const handleEliminarUsuario = async (userId) => {
        try {
            await eliminarUsuario(userId);
            setActionStatus({ open: true, type: 'success', message: 'Usuario eliminado correctamente.' });
            if (onUpdate) onUpdate();
            return true;
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            setActionStatus({ open: true, type: 'error', message: `Error: ${error.message}` });
            return false;
        }
    };

    return {
        // Subida de archivos
        uploadUserDoc,
        // KYC
        updateUserKYC,
        // Fase del crédito (ahora vía CF)
        updateUserPhase,
        // Gestión de usuario (ahora vía CF)
        updateUserAdminData,
        handleBloquearUsuario,
        handleReactivarUsuario,
        handleEliminarUsuario,
        // Estado
        uploading,
        actionStatus,
        closeActionStatus: () => setActionStatus({ ...actionStatus, open: false }),
    };
};
