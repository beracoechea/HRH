/* src/pages/hooks/useUserManager.js
 *
 * REFACTORIZADO — Ahora usa exclusivamente la capa API para mutaciones.
 *
 * CAMBIOS:
 * ─ Elimina reparación de datos en el cliente (era lógica de negocio frágil).
 * ─ updateCreditStatus ahora usa actualizarEstadoCredito de creditApi.
 * ─ Mantiene listeners (onSnapshot) para reactividad en tiempo real.
 */
import { useState, useEffect, useCallback, useMemo } from 'react'
import { db } from '../../firebase/config'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { useFirestoreOperation } from './core/useFirestoreOperation'
import { ROLE_PERMISSIONS } from '../../helpers/permissions'
import { actualizarEstadoCredito } from '../../api/creditApi'

export const useUserManager = (currentUser = null, selectedGroup = null) => {
  const isHRH = currentUser?.grupo?.toUpperCase() === 'HRH';
  const userGroup = currentUser?.grupo;
  const permissions = ROLE_PERMISSIONS[currentUser?.rol] || ROLE_PERMISSIONS.cliente;

  const [data, setData] = useState({
    allUsers: [], 
    allCreditos: [], 
    pendingCitas: [],
  })

  const { loading, execute } = useFirestoreOperation()

  useEffect(() => {
    if (!currentUser) return;
    if (!isHRH && !userGroup) {
        setData({ allUsers: [], allCreditos: [], pendingCitas: [] });
        return;
    }

    const views = permissions.views || [];
    const unsubs = [];

    // --- LÓGICA DE FILTRADO PARA USUARIOS ---
    if (views.includes('usuarios') || isHRH) {
        const qUsers = isHRH 
          ? collection(db, 'usuarios')
          : query(collection(db, 'usuarios'), where('grupo', '==', userGroup));
        
        const unsubUsers = onSnapshot(qUsers, (snap) => {
          setData(prev => ({ ...prev, allUsers: snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) }));
        }, (err) => console.error("Error en listener usuarios:", err));
        unsubs.push(unsubUsers);
    }

    // --- LÓGICA DE FILTRADO PARA CITAS ---
    if (views.includes('citas') || views.includes('mesa') || isHRH) {
        const qCitas = (isHRH && !selectedGroup)
          ? collection(db, 'citas')
          : query(collection(db, 'citas'), where('grupo', '==', isHRH ? selectedGroup : userGroup));
        
        const unsubCitas = onSnapshot(qCitas, (snap) => {
          setData(prev => ({ ...prev, pendingCitas: snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) }));
        }, (err) => console.error("Error en listener citas:", err));
        unsubs.push(unsubCitas);
    }

    // --- LÓGICA DE FILTRADO PARA CRÉDITOS ---
    if (views.includes('mesa') || views.includes('tesoreria') || views.includes('stats') || views.includes('usuarios') || isHRH) {
        const qCreditos = isHRH
          ? collection(db, 'creditos')
          : query(collection(db, 'creditos'), where('usuario_grupo', '==', userGroup));
        
        const unsubCreditos = onSnapshot(qCreditos, (snap) => {
          setData(prev => ({ ...prev, allCreditos: snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) }));
        }, (err) => console.error("Error en listener créditos:", err));
        unsubs.push(unsubCreditos);
    }

    return () => {
      unsubs.forEach(u => u());
    };
  }, [currentUser, isHRH, userGroup, selectedGroup, permissions]);

  const normalizeId = (id) => {
    if (!id) return '';
    return id.toString().toLowerCase().trim().replace(/\s+/g, '_');
  };

  const users = useMemo(() => {
    const list = data.allUsers;
    if (!isHRH || !selectedGroup) return list;
    const target = normalizeId(selectedGroup);
    return list.filter(u => normalizeId(u.grupo) === target);
  }, [data.allUsers, isHRH, selectedGroup]);

  const pendingCitas = useMemo(() => {
    const list = data.pendingCitas;
    if (!isHRH || !selectedGroup) return list;
    const target = normalizeId(selectedGroup);
    return list.filter(c => normalizeId(c.grupo || c.usuario_grupo) === target);
  }, [data.pendingCitas, isHRH, selectedGroup]);

  const creditos = useMemo(() => {
    const listWithGroups = data.allCreditos.map(cre => {
        if (!cre.usuario_grupo && !cre.grupo) {
            const owner = data.allUsers.find(u => u.id === cre.usuario_id || u.uid === cre.usuario_id);
            if (owner && owner.grupo) return { ...cre, usuario_grupo: owner.grupo };
        }
        return cre;
    });

    const sorted = [...listWithGroups].sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
    });

    if (!isHRH || !selectedGroup) return sorted;
    const target = normalizeId(selectedGroup);
    return sorted.filter(c => normalizeId(c.usuario_grupo || c.grupo) === target);
  }, [data.allCreditos, data.allUsers, isHRH, selectedGroup]);

  const ingresosReales = useMemo(() => {
    const allPayments = creditos.flatMap(c => c.historialPagos || []);
      const grouped = allPayments.reduce((acc, p) => {
        const fechaRaw = p.fecha || p.createdAt;
        if (!fechaRaw) return acc;
        const fecha = new Date(fechaRaw);
        const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`; 
        const monthName = fecha.toLocaleString('es-MX', { month: 'long' });
        const label = monthName.charAt(0).toUpperCase() + monthName.slice(1) + ' ' + fecha.getFullYear();
        if (!acc[key]) acc[key] = { mes: label, monto: 0 };
        acc[key].monto += (Number(p.monto) || 0);
        return acc;
      }, {});
    return Object.keys(grouped).sort().map(key => grouped[key]);
  }, [creditos]);

  const refreshData = useCallback(async () => Promise.resolve(), []);

  // ── Mutación a través de Cloud Function ────────────────────
  const updateCreditStatusFn = useCallback(async (payload) => {
    const { creditoId, estado } = payload;
    if (!creditoId || !estado) throw new Error("ID y estado requeridos");
    return execute(async () => {
      await actualizarEstadoCredito(creditoId, estado);
    });
  }, [execute]);

  return {
    users,
    pendingCitas,
    creditos,
    ingresosReales,
    loading,
    refreshData,
    updateCreditStatus: updateCreditStatusFn,
  }
}