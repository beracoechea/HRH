/* src/pages/hooks/useAuthActions.js */
import { useState } from 'react';
import { auth, db } from '../../firebase/config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc, updateDoc } from 'firebase/firestore';

export const useAuthActions = (onUpdate) => { 
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ open: false, type: '', message: '' });

    // --- NUEVA FUNCIÓN PARA ACTUALIZAR ROL ---
    /**
     * Actualiza datos administrativos del usuario (Rol y Grupo) de forma independiente.
     */
    const updateUserAdminData = async (userId, userEmail, updates = {}) => {
        setLoading(true);
        console.log("=== ACTUALIZACIÓN ADMINISTRATIVA ===", { userId, updates });
        
        try {
            if (!userId) throw new Error("ID de usuario no proporcionado.");
            
            const userRef = doc(db, "usuarios", userId);
            const updateData = {
                updatedAt: serverTimestamp()
            };

            if (updates.rol) {
                updateData.rol = updates.rol;
            }

            if (updates.grupo !== undefined) {
                updateData.grupo = updates.grupo;
                updateData.idGrupo = updates.grupo ? updates.grupo.toLowerCase().replace(/\s+/g, '_') : null;
            }

            await updateDoc(userRef, updateData);

            setStatus({ 
                open: true, 
                type: 'success', 
                message: `Datos de ${userEmail} actualizados correctamente.` 
            });

            if (onUpdate) await onUpdate();
            
            return true;
        } catch (error) {
            console.error("Error updating user admin data:", error);
            setStatus({ 
                open: true, 
                type: 'error', 
                message: `Error: ${error.message || "No se pudo actualizar la información."}` 
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleAuth = async (isLogin, formData) => {
        setLoading(true);
        try {
            if (isLogin) {
                const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
                const userDoc = await getDoc(doc(db, "usuarios", userCredential.user.uid));
                if (!userDoc.exists()) throw new Error("no-profile");
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                const user = userCredential.user;
                await updateProfile(user, { displayName: formData.nombre });
                const userDocRef = doc(db, "usuarios", user.uid); 
                await setDoc(userDocRef, {
                    uid: user.uid,
                    nombre: formData.nombre,
                    email: formData.email,
                    rol: 'cliente', 
                    status: 'active',
                    fecha_registro: serverTimestamp()
                });
            }
            return true; 
        } catch (error) {
            // ... (tu lógica de errores actual)
            setStatus({ open: true, type: 'error', message: error.message });
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { 
        handleAuth, 
        updateUserAdminData, // <-- Cambiado de updateUserRole
        loading, 
        status, 
        closeStatus: () => setStatus({ ...status, open: false }) 
    };
};