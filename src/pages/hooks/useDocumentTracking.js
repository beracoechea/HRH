/* src/pages/hooks/useDocumentTracking.js
 *
 * REFACTORIZADO — Aprobación/Rechazo de documentos vía backend.
 *
 * CAMBIOS:
 * ─ Reemplaza updateDoc directo por actualizarEstadoDocumentos (creditApi).
 * ─ Mantiene listeners para visibilidad de cambios.
 */
import { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, onSnapshot, query, where, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { actualizarEstadoDocumentos } from '../../api/creditApi';

export const useDocumentTracking = (currentUser = null, selectedGroup = null) => {
  const [creditosDocs, setCreditosDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const isHRH = currentUser?.grupo?.toUpperCase() === 'HRH';
  const userGroup = currentUser?.grupo;

  useEffect(() => {
    if (!currentUser) return;
    if (!isHRH && !userGroup) {
      setCreditosDocs([]);
      setLoading(false);
      return;
    }

    let q = isHRH
      ? collection(db, "creditos")
      : query(collection(db, "creditos"), where("usuario_grupo", "==", userGroup));

    const unsub = onSnapshot(q, (snapshot) => {
      let docs = snapshot.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        expediente: d.data().expediente || [] 
      }));

      if (isHRH && selectedGroup) {
        docs = docs.filter(d => {
            const cGroup = (d.usuario_grupo || d.grupo || '').toLowerCase().trim().replace(/\s+/g, '_');
            return cGroup === selectedGroup.toLowerCase();
        });
      }

      setCreditosDocs(docs);
      setLoading(false);
    }, (err) => {
      console.error("Error en useDocumentTracking snapshot:", err);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser, isHRH, userGroup, selectedGroup]);

  // ─── Funciones de mutación delegadas al backend ─────────────────

  const updateMultipleDocs = async (creditoId, updates, observaciones) => {
    if (!creditoId) return { success: false };
    try {
      const formattedUpdates = updates.map(u => ({
          nombreDoc: u.tipo, // El componente usa 'tipo' para identificar
          status: u.status,
          observaciones
      }));

      await actualizarEstadoDocumentos(creditoId, formattedUpdates);
      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false };
    }
  };

  const updateSingleDocStatus = async (creditoId, docNombre, newStatus, observaciones = "") => {
    if (!creditoId || !docNombre) return { success: false };
    try {
      await actualizarEstadoDocumentos(creditoId, [{
          nombreDoc: docNombre,
          status: newStatus,
          observaciones
      }]);
      return { success: true };
    } catch (e) {
      console.error("Error updating single doc:", e);
      return { success: false };
    }
  };

  // NOTA: addAdminDocument y removeAdminDocument todavía escriben directo al expediente.
  // Como el expediente no está bloqueado para staff en las reglas, funcionan,
  // pero para perfecta separación se deberían mover a Cloud Functions en el futuro.
  const addMultipleFolderDocuments = async (creditoId, carpetaId, uploadedDocs) => {
    if (!creditoId || uploadedDocs.length === 0) return { success: false };
    try {
      const docRef = doc(db, 'creditos', creditoId);
      
      const newExpedienteItems = uploadedDocs.map(docData => ({
        nombre: docData.nombre,
        url: docData.url,
        carpeta: carpetaId,
        estatus: 'aprobado', // Archivos administrativos se aprueban por defecto
        timestamp: new Date()
      }));

      await updateDoc(docRef, {
        expediente: arrayUnion(...newExpedienteItems)
      });
      return { success: true };
    } catch (e) {
      console.error("Error adding multiple folder docs:", e);
      return { success: false };
    }
  };

  const removeAdminDocument = async (creditoId, docNombre) => {
    if (!creditoId || !docNombre) return { success: false };
    try {
      const docRef = doc(db, 'creditos', creditoId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return { success: false };
      
      const currentExpediente = snap.data().expediente || [];
      const updatedExpediente = currentExpediente.filter(d => d.nombre !== docNombre);
      
      await updateDoc(docRef, {
        expediente: updatedExpediente
      });
      return { success: true };
    } catch (e) {
      console.error("Error removing admin doc:", e);
      return { success: false };
    }
  };

  return { 
    creditosDocs, 
    loading, 
    updateMultipleDocs, 
    updateSingleDocStatus,
    addMultipleFolderDocuments,
    removeAdminDocument
  };
};