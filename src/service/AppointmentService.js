import { db } from '../firebase/config';
import { 
    collection, addDoc, serverTimestamp, query, getDocs, 
    orderBy, doc, updateDoc, deleteField, where // <--- Asegúrate de incluir 'where'
} from 'firebase/firestore';

export class AppointmentService {
    constructor() {
        this.collectionName = 'citas';
    }

    /**
     * Obtiene las citas de un usuario específico
     * @param {string} userId - El ID del usuario (uid)
     */
    async getByUsuario(userId) {
        try {
            // Creamos la consulta buscando donde 'usuario_id' sea igual al ID del usuario
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
            console.error("Error al obtener citas por usuario:", error);
            // Si el error es por falta de un índice compuesto en Firebase, 
            // intenta quitar el orderBy temporalmente.
            return [];
        }
    }

    async crearCita(appointmentData) {
        try {
            const nuevaCita = {
                ...appointmentData,
                estatus: 'pendiente', 
                createdAt: serverTimestamp(),
            };

            if (nuevaCita.estado) delete nuevaCita.estado;

            const docRef = await addDoc(collection(db, this.collectionName), nuevaCita);
            return docRef.id;
        } catch (error) {
            console.error("Error al crear cita:", error);
            throw error;
        }
    }

    async getAllCitas() {
        try {
            const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error al obtener citas:", error);
            return [];
        }
    }

    async actualizarEstadoCita(citaId, nuevoEstado) {
        try {
            const citaRef = doc(db, this.collectionName, citaId);
            await updateDoc(citaRef, {
                estatus: nuevoEstado,
                updatedAt: serverTimestamp(),
                estado: deleteField() 
            });
            return true;
        } catch (error) {
            console.error("Error al actualizar estado:", error);
            throw error;
        }
    }
}