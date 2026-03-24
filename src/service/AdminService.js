// src/services/AdminService.js
import { db } from '../firebase/config';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';

export class AdminService {
    // Obtener todos los usuarios
    async getAllUsers() {
        const snapshot = await getDocs(collection(db, 'usuarios'));
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    // Obtener citas por estatus (ej. 'pendiente')
    async getCitasByStatus(status = 'pendiente') {
        const q = query(collection(db, 'citas'), where('estatus', '==', status));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    // Actualizar rol de usuario
    async updateUserRole(uid, newRole) {
        const userRef = doc(db, 'usuarios', uid);
        await updateDoc(userRef, { rol: newRole });
    }
}