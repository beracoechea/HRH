import { FirestoreService } from './FirestoreService';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signOut 
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore'; // Añadido updateDoc

export class AuthService extends FirestoreService {
  constructor() {
    // CAMBIO: Usamos 'usuarios' para coincidir con tu hook y el panel de admin
    super('usuarios'); 
    this.auth = auth;
  }

  async login(email, password) {
    try {
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      throw this._mapAuthError(error);
    }
  }

  async register(nombre, email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: nombre });

      // CAMBIO: Estandarizamos los campos (rol, fecha_registro)
      const userDocRef = doc(db, 'usuarios', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        nombre,
        email,
        rol: 'cliente', // Estandarizado a 'rol' y 'cliente'
        status: 'active',
        fecha_registro: serverTimestamp(), // Coincide con tu hook
        lastLogin: serverTimestamp()
      });

      return user;
    } catch (error) {
      throw this._mapAuthError(error);
    }
  }

  async logout() {
    return await signOut(this.auth);
  }

  async updateUserRoleInDB(userId, newRole) {
    // CAMBIO: Usamos 'usuarios' y el campo 'rol'
    const userRef = doc(db, 'usuarios', userId);
    return await updateDoc(userRef, {
        rol: newRole, 
        updatedAt: serverTimestamp()
    });
  }

  _mapAuthError(error) {
    const codes = {
      'auth/user-not-found': 'El correo no está registrado.',
      'auth/wrong-password': 'Contraseña incorrecta.',
      'auth/email-already-in-use': 'Este correo ya tiene una cuenta.',
      'auth/weak-password': 'La contraseña es muy débil.',
      'auth/invalid-email': 'Formato de correo inválido.'
    };
    return new Error(codes[error.code] || 'Error en la autenticación.');
  }
}