import { useState } from 'react';
import { db, storage } from '../../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { CREDIT_STEPS } from '../../constants/creditSteps';

export const useAdminUserActions = (onUpdate) => {
    const [uploading, setUploading] = useState(false);
    const [actionStatus, setActionStatus] = useState({ open: false, type: '', message: '' });

    const uploadUserDoc = async (userId, file, docName, isSignatureRequest = false, creditId = null) => {
        if (!userId || !file) return;
        setUploading(true);

        try {
            // 1. Subir a Storage
            const folder = isSignatureRequest ? 'firmas' : (creditId ? 'creditos' : 'expediente');
            const storagePath = `usuarios/${userId}/${folder}/${Date.now()}_${file.name}`;
            const fileRef = ref(storage, storagePath);
            await uploadBytes(fileRef, file);
            const downloadURL = await getDownloadURL(fileRef);

            // 2. Actualizar Firestore
            const isBuro = docName?.toLowerCase().includes('buró');
            const newDoc = {
                nombre: docName || file.name,
                url: downloadURL,
                estatus: isSignatureRequest ? 'pendiente_firma' : 'aprobado',
                fecha_subida: new Date().toISOString(),
                tipo_documento: isBuro ? 'buro' : (isSignatureRequest ? 'firma_solicitada' : 'extra'),
                storage_path: storagePath,
                requiere_firma: isSignatureRequest
            };

            const targetRef = creditId ? doc(db, "creditos", creditId) : doc(db, "usuarios", userId);
            
            await updateDoc(targetRef, {
                expediente: arrayUnion(newDoc),
                updatedAt: serverTimestamp()
            });

            setActionStatus({ 
                open: true, 
                type: 'success', 
                message: isSignatureRequest ? "Solicitud de firma enviada correctamente." : "Archivo añadido al expediente correctamente." 
            });

            if (onUpdate) onUpdate();
            return true;

        } catch (error) {
            console.error("Error uploading user doc:", error);
            setActionStatus({ 
                open: true, 
                type: 'error', 
                message: "Error al procesar el archivo. Inténtalo de nuevo." 
            });
            return false;
        } finally {
            setUploading(false);
        }
    };

    const updateUserKYC = async (userId, kycData) => {
        if (!userId || !kycData) return;
        try {
            const userRef = doc(db, "usuarios", userId, "perfil", "kyc");
            await updateDoc(userRef, {
                ...kycData,
                updatedAt: serverTimestamp()
            });
            
            // También actualizamos un flag en el documento principal por si acaso
            const mainUserRef = doc(db, "usuarios", userId);
            await updateDoc(mainUserRef, {
                kyc: kycData, // Denormalización para vista rápida
                // Sincronizar teléfono y nombre a nivel raíz para acceso rápido
                ...(kycData.telefono && { telefono: kycData.telefono }),
                ...(kycData.nombreCompleto && { nombre: kycData.nombreCompleto }),
                updatedAt: serverTimestamp()
            });

            setActionStatus({ 
                open: true, 
                type: 'success', 
                message: "Información KYC actualizada exitosamente." 
            });

            if (onUpdate) onUpdate();
            return true;
        } catch (error) {
            console.error("Error updating KYC:", error);
            setActionStatus({ 
                open: true, 
                type: 'error', 
                message: "Error al actualizar la información KYC." 
            });
            return false;
        }
    };

    const updateUserPhase = async (creditoId, newPhase) => {
        if (!creditoId) return;
        try {
            const creditoRef = doc(db, "creditos", creditoId);
            const stepInfo = CREDIT_STEPS.find(s => s.id === Number(newPhase));
            
            const historyEntry = {
                fase: Number(newPhase),
                timestamp: new Date(),
                estimatedHours: stepInfo?.estimatedHours || 0
            };

            await updateDoc(creditoRef, {
                fase: Number(newPhase),
                historialPasos: arrayUnion(historyEntry),
                updatedAt: serverTimestamp()
            });
            if (onUpdate) onUpdate(); 
            return true;
        } catch (error) {
            console.error("Error updating phase:", error);
            return false;
        }
    };

    return { 
        uploadUserDoc, 
        updateUserPhase,
        updateUserKYC,
        uploading, 
        actionStatus, 
        closeActionStatus: () => setActionStatus({ ...actionStatus, open: false }) 
    };
};
