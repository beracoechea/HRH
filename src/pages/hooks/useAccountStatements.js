import { useState, useEffect } from 'react';
import { db, storage } from '../../firebase/config';
import { 
    collection, onSnapshot, query, orderBy, 
    addDoc, serverTimestamp, deleteDoc, doc 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export const useAccountStatements = (creditId) => {
    const [statements, setStatements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!creditId) return;

        const q = query(
            collection(db, 'creditos', creditId, 'estados_cuenta'),
            orderBy('createdAt', 'desc')
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            }));
            setStatements(docs);
        }, (err) => {
            console.error("Error fetching account statements:", err);
            setError(err.message);
        });

        return () => unsub();
    }, [creditId]);

    const uploadStatement = async (file, customName, adminId) => {
        if (!creditId || !file) return { success: false, message: "Faltan datos requeridos" };
        
        setLoading(true);
        try {
            // 1. Subir a Storage
            const timestamp = Date.now();
            const fileName = `${timestamp}_${file.name.replace(/\s+/g, '_')}`;
            const storagePath = `estados_cuenta/${creditId}/${fileName}`;
            const storageRef = ref(storage, storagePath);
            
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // 2. Guardar en Firestore (Sub-colección)
            await addDoc(collection(db, 'creditos', creditId, 'estados_cuenta'), {
                nombre: customName || file.name,
                url: downloadURL,
                storagePath,
                uploadedBy: adminId || 'admin',
                createdAt: serverTimestamp(),
                size: file.size,
                type: file.type
            });

            return { success: true };
        } catch (err) {
            console.error("Error uploading statement:", err);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    };

    const deleteStatement = async (statementId, storagePath) => {
        if (!creditId || !statementId) return { success: false };
        
        try {
            // 1. Eliminar de Storage si tenemos el path
            if (storagePath) {
                const storageRef = ref(storage, storagePath);
                await deleteObject(storageRef);
            }

            // 2. Eliminar de Firestore
            await deleteDoc(doc(db, 'creditos', creditId, 'estados_cuenta', statementId));
            
            return { success: true };
        } catch (err) {
            console.error("Error deleting statement:", err);
            return { success: false, message: err.message };
        }
    };

    return {
        statements,
        loading,
        error,
        uploadStatement,
        deleteStatement
    };
};
