import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBZBUxKn2uaj1lakn8WvwWtVGVjS5tAyec",
  authDomain: "stratego-firma.firebaseapp.com",
  projectId: "stratego-firma",
  storageBucket: "stratego-firma.firebasestorage.app",
  messagingSenderId: "411011222977",
  appId: "1:411011222977:web:b82c625d51521082463340"
};

// Inicializar la App (evitando duplicados)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// --- EXPORTACIONES ---

// 1. Exportar Auth (Esto soluciona tu SyntaxError)
export const auth = getAuth(app); 

// 2. Exportar Firestore apuntando a la base de datos 'credigo'
export const db = getFirestore(app, "credigo");

// 3. Exportar Storage si lo usas
export const storage = getStorage(app);

export default app;