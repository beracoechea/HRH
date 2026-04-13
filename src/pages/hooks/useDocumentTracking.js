import { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, onSnapshot, doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export const useDocumentTracking = (currentUser = null) => {
  const [creditosDocs, setCreditosDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const isHRH = currentUser?.grupo?.toUpperCase() === 'HRH';
  const userGroup = currentUser?.grupo;

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "creditos"), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        expediente: d.data().expediente || [] 
      }));

      const filtered = !isHRH && userGroup 
        ? docs.filter(d => d.grupo === userGroup || d.usuario_grupo === userGroup)
        : docs;

      setCreditosDocs(filtered);
      setLoading(false);
    });
    return () => unsub();
  }, [isHRH, userGroup]);

  const updateMultipleDocs = async (creditoId, updates, observaciones) => {
    if (!creditoId) return { success: false };
    try {
      const docRef = doc(db, "creditos", creditoId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return { success: false };

      const data = docSnap.data();
      const nuevoExpediente = data.expediente.map(docItem => {
        const update = updates.find(u => u.tipo === docItem.tipo_documento);
        if (update) {
          return { 
            ...docItem, 
            estatus: update.status, 
            observaciones: update.status === 'rechazado' ? observaciones : "",
            url: update.status === 'rechazado' ? null : docItem.url 
          };
        }
        return docItem;
      });

      await updateDoc(docRef, { expediente: nuevoExpediente });
      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false };
    }
  };

  const updateSingleDocStatus = async (creditoId, docNombre, newStatus, observaciones = "") => {
    if (!creditoId || !docNombre) return { success: false };
    try {
      const docRef = doc(db, "creditos", creditoId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return { success: false };

      const data = docSnap.data();
      const nuevoExpediente = data.expediente.map(docItem => {
        if (docItem.nombre === docNombre) {
          return { 
            ...docItem, 
            estatus: newStatus, 
            observaciones: newStatus === 'rechazado' ? observaciones : (docItem.observaciones || ""),
            url: newStatus === 'rechazado' ? null : docItem.url 
          };
        }
        return docItem;
      });

      await updateDoc(docRef, { expediente: nuevoExpediente, lastUpdate: serverTimestamp() });
      return { success: true };
    } catch (e) {
      console.error("Error updating single doc:", e);
      return { success: false };
    }
  };

  const addAdminDocument = async (creditoId, docNombre, docUrl) => {
    if (!creditoId || !docNombre || !docUrl) return { success: false };
    try {
      const docRef = doc(db, "creditos", creditoId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return { success: false };

      const data = docSnap.data();
      const nuevoExpediente = [
        ...(data.expediente || []),
        {
          nombre: docNombre,
          url: docUrl,
          estatus: 'aprobado',
          tipo_documento: 'ADMIN',
          isAdmin: true,
          fecha_subida: new Date().toISOString()
        }
      ];

      await updateDoc(docRef, { expediente: nuevoExpediente, lastUpdate: serverTimestamp() });
      return { success: true };
    } catch (e) {
      console.error("Error adding admin doc:", e);
      return { success: false };
    }
  };

  return { creditosDocs, loading, updateMultipleDocs, updateSingleDocStatus, addAdminDocument };
};