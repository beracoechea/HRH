import { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';

export const useDocumentTracking = () => {
  const [creditosDocs, setCreditosDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "creditos"), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        expediente: d.data().expediente || [] 
      }));
      setCreditosDocs(docs);
      setLoading(false);
    });
    return () => unsub();
  }, []);

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

  return { creditosDocs, loading, updateMultipleDocs };
};