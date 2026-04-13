import { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { 
    collection, getDocs, query, addDoc, 
    orderBy, serverTimestamp, onSnapshot 
} from 'firebase/firestore';

export const useGroups = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchGroups = async () => {
        try {
            const q = query(collection(db, 'grupos'), orderBy('nombre', 'asc'));
            const snapshot = await getDocs(q);
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setGroups(list);
        } catch (error) {
            console.error("Error fetching groups:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const addGroup = async (name, adminId) => {
        if (!name.trim()) return { success: false, message: "Nombre inválido" };
        
        const normalizedId = name.toLowerCase().trim().replace(/\s+/g, '_');
        
        // Evitar duplicados locales
        if (groups.some(g => g.id_grupo === normalizedId)) {
            return { success: false, message: "Este grupo ya existe" };
        }

        try {
            const docRef = await addDoc(collection(db, 'grupos'), {
                nombre: name.trim(),
                id_grupo: normalizedId,
                createdBy: adminId || 'sistema',
                createdAt: serverTimestamp()
            });
            
            // Refrescar lista manualmente
            await fetchGroups();
            
            return { success: true, id: docRef.id, name: name.trim() };
        } catch (error) {
            console.error("Error adding group:", error);
            return { success: false, message: "Error al guardar en base de datos" };
        }
    };

    return { groups, loading, addGroup, refreshGroups: fetchGroups };
};
