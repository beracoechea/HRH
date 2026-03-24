// src/services/FirestoreService.js
import { db } from '../firebase/config';
import { 
  doc, 
  updateDoc, 
  addDoc, 
  collection, 
  serverTimestamp, 
  getDoc 
} from 'firebase/firestore';

export class FirestoreService {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.db = db;
  }

  // Crear un documento nuevo
  async create(data) {
    try {
      const ref = collection(this.db, this.collectionName);
      return await addDoc(ref, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Actualizar un documento existente
  async update(id, data) {
    try {
      const ref = doc(this.db, this.collectionName, id);
      return await updateDoc(ref, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtener un solo documento
  async getOne(id) {
    try {
      const ref = doc(this.db, this.collectionName, id);
      const snap = await getDoc(ref);
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    console.error(`[${this.collectionName} Service Error]:`, error);
    return new Error(error.message || "Error en la operación de base de datos");
  }
}