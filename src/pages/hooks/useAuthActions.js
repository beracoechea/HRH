/* src/pages/hooks/useAuthActions.js */
import { useState } from 'react';
import { auth, db } from '../../firebase/config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc, updateDoc } from 'firebase/firestore';

export const useAuthActions = (onUpdate) => { 
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ open: false, type: '', message: '' });

    // --- NUEVA FUNCIÓN PARA ACTUALIZAR ROL ---
    const updateUserRole = async (userId, userEmail, newRole) => {
        setLoading(true);
        try {
            const userRef = doc(db, "usuarios", userId);
            await updateDoc(userRef, {
                rol: newRole,
                updatedAt: serverTimestamp()
            });

            setStatus({ 
                open: true, 
                type: 'success', 
                message: `Rol de ${userEmail} actualizado a ${newRole}` 
            });

            // Disparar el refresh si existe la función
            if (onUpdate) onUpdate();
            
            return true;
        } catch (error) {
            console.error("Error updating role:", error);
            setStatus({ 
                open: true, 
                type: 'error', 
                message: "No tienes permisos para cambiar roles o error de red." 
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
        updateUserRole, // <-- Ahora sí se exporta
        loading, 
        status, 
        closeStatus: () => setStatus({ ...status, open: false }) 
    };
};