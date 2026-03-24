// src/services/BlogService.js
import { FirestoreService } from './FirestoreService';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase/config';

export class BlogService extends FirestoreService {
  constructor() {
    super('blogs'); // Nombre de la colección en Firestore
  }

  // Obtener solo blogs activos para el público
  async getPublicBlogs() {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('activa', '==', true),
        orderBy('fecha_publicacion', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.log("Base de datos actual:", db._databaseId.database);
      throw this.handleError(error);
    }
  }

  // Suscripción en tiempo real (para el panel de administración)
  subscribeToAll(callback) {
    const q = query(collection(db, this.collectionName), orderBy('updatedAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const blogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(blogs);
    });
  }
}