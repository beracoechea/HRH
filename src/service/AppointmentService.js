import { db } from '../firebase/config';
import { 
    collection, addDoc, serverTimestamp, query, getDocs, 
    orderBy, doc, updateDoc, where 
} from 'firebase/firestore';

export class AppointmentService {
    constructor() {
        this.collectionName = 'citas';
    }

    async getByUsuario(userId) {
        try {
            // Consulta unificada con tus reglas de seguridad
            const q = query(
                collection(db, this.collectionName), 
                where("usuario_id", "==", userId),
                orderBy('createdAt', 'desc')
            );
            
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            }));
        } catch (error) {
            console.error("Error al obtener citas. ¿Ya creaste el índice en Firebase?:", error);
            return [];
        }
    }

    async getAllCitas(grupo = null) {
        try {
            let q = collection(db, this.collectionName);
            
            if (grupo) {
                q = query(q, where('grupo', '==', grupo), orderBy('createdAt', 'desc'));
            } else {
                q = query(q, orderBy('createdAt', 'desc'));
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error al obtener todas las citas:", error);
            return [];
        }
    }

    async crearCita(appointmentData) {
        try {
            const nuevaCita = {
                ...appointmentData,
                usuario_id: appointmentData.user_id, // Mapeo para consistencia
                estatus: 'solicitada', 
                createdAt: serverTimestamp(),
            };
            // Limpieza de campos duplicados
            delete nuevaCita.user_id; 

            const docRef = await addDoc(collection(db, this.collectionName), nuevaCita);
            return docRef.id;
        } catch (error) {
            console.error("Error al crear cita:", error);
            throw error;
        }
    }
}