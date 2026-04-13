import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyD02aMFVVsJRLf6tYFQNuVWvaFuK01zWGc",
  authDomain: "credigo-f6ac4.firebaseapp.com",
  projectId: "credigo-f6ac4",
  storageBucket: "credigo-f6ac4.firebasestorage.app",
  messagingSenderId: "296121254537",
  appId: "1:296121254537:web:2ee923b93c63e0ac3c3c58",
  measurementId: "G-DCNVVM1NJ0"
};

// Inicializar la App (evitando duplicados)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// --- EXPORTACIONES ---

// 1. Exportar Auth (Esto soluciona tu SyntaxError)
export const auth = getAuth(app); 

export const db = getFirestore(app);

// 3. Exportar Storage si lo usas
export const storage = getStorage(app);

// 4. Exportar Functions
export const functions = getFunctions(app);

export default app;