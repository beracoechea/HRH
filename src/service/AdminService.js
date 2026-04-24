// src/service/AdminService.js
//
// REFACTORIZADO: Esta clase es ahora SOLO de LECTURA desde el frontend.
// ──────────────────────────────────────────────────────────────────────
// ✅ PERMITIDO aquí: queries de lectura a Firestore (getDocs, onSnapshot)
// ❌ ELIMINADO:      updateUserRole (ahora vive en adminApi.js → Cloud Function)
//
// Toda escritura de datos privilegiados (rol, status, grupo) debe hacerse
// vía src/api/adminApi.js que llama a las Cloud Functions del backend.

import { db } from '../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';

export class AdminService {
    /**
     * Obtiene todos los usuarios (con filtro opcional por grupo).
     * @param {string|null} grupo - Filtrar por grupo de franquicia
     */
    async getAllUsers(grupo = null) {
        let q = collection(db, 'usuarios');

        if (grupo) {
            q = query(q, where('grupo', '==', grupo));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    /**
     * Obtiene citas filtradas por estatus.
     * @param {string} status - Ej: 'pendiente', 'confirmada'
     */
    async getCitasByStatus(status = 'pendiente') {
        const q = query(collection(db, 'citas'), where('estatus', '==', status));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    // NOTA: updateUserRole fue ELIMINADO.
    // Usar: import { asignarRolUsuario } from '../api/adminApi';
}