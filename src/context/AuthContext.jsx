/* src/context/AuthContext.jsx */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    // AQUÍ ESTABA EL ERROR: Faltaba definir setIsAuthenticated
    const [isAuthenticated, setIsAuthenticated] = useState(false); 
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true);
            if (firebaseUser) {
                try {
                    // Sincronización con la colección "usuarios" (en español)
                    const userRef = doc(db, "usuarios", firebaseUser.uid);
                    let userSnap = await getDoc(userRef);

                    // Reintento breve por si la creación del doc es lenta (race condition en signup)
                    if (!userSnap.exists()) {
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        userSnap = await getDoc(userRef);
                    }

                    if (userSnap.exists()) {
                        const userData = {
                            uid: firebaseUser.uid,
                            ...userSnap.data()
                        };
                        setUser(userData);
                        setIsAuthenticated(true); // Ahora sí funcionará
                    } else {
                        console.warn("El documento no existe en la colección 'usuarios' tras reintento");
                        setUser(null);
                        setIsAuthenticated(false);
                    }
                } catch (error) {
                    console.error("Error al obtener documento de Firestore:", error);
                    setIsAuthenticated(false);
                }
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = () => signOut(auth);
    const openLogin = () => setIsAuthModalOpen(true);
    const closeLogin = () => setIsAuthModalOpen(false);

    const value = {
        user,
        isAuthenticated,
        loading,
        isAuthModalOpen,
        openLogin,
        closeLogin,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);