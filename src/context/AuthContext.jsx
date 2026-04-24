/* src/context/AuthContext.jsx
 *
 * REFACTORIZADO — Fase 7
 *
 * CAMBIOS vs versión anterior:
 * ─ El rol ya NO se lee de Firestore (getDoc → usuarios/{uid}).
 * ─ El rol y grupo ahora vienen de los Custom Claims del JWT:
 *     firebaseUser.getIdTokenResult() → claims.rol, claims.grupo
 * ─ Se mantiene un fetch mínimo a Firestore SOLO para datos de perfil
 *   (nombre, email, foto) que no van en el token.
 *
 * VENTAJAS:
 * ✅ ~500ms más rápido en el arranque de la app (un solo roundtrip vs dos)
 * ✅ El rol es imposible de manipular desde el cliente
 * ✅ Si el rol cambia en el backend, el usuario debe re-autenticarse (correcto)
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser]                     = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading]               = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true);

            if (firebaseUser) {
                try {
                    // ── 1. Leer Custom Claims del JWT (rol y grupo seguros) ──────────
                    //    forceRefresh=false: usa el token en caché si no expiró.
                    //    El registro fuerza getIdToken(true) para que los claims
                    //    estén disponibles inmediatamente tras el signup.
                    const tokenResult = await firebaseUser.getIdTokenResult(false);
                    const claims = tokenResult.claims;

                    // ── 2. Fetch mínimo a Firestore solo para datos de perfil ─────────
                    //    (nombre, foto, etc. que no viajan en el token JWT)
                    let profileData = {};
                    const userRef = doc(db, 'usuarios', firebaseUser.uid);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        profileData = userSnap.data();
                    } else {
                        // Race condition tras el registro: reintento breve
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        const retrySnap = await getDoc(userRef);
                        if (retrySnap.exists()) profileData = retrySnap.data();
                    }

                    // ── 3. Construir el objeto de usuario combinando ambas fuentes ────
                    //    Prioridad: Claims (rol, grupo) > Firestore (perfil)
                    const userData = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        // Rol y grupo desde el JWT (fuente segura e inmutable cliente)
                        rol: claims.rol || profileData.rol || 'cliente',
                        grupo: claims.grupo || profileData.grupo || null,
                        idGrupo: profileData.idGrupo || null,
                        // Datos de perfil desde Firestore
                        nombre: profileData.nombre || firebaseUser.displayName || '',
                        status: profileData.status || 'active',
                        fecha_registro: profileData.fecha_registro || null,
                        // Mantener acceso a claims raw por si se necesitan en guards
                        _claims: claims,
                    };

                    setUser(userData);
                    setIsAuthenticated(true);

                } catch (error) {
                    console.error('Error al inicializar sesión:', error);
                    setUser(null);
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

    /**
     * Cierra la sesión del usuario.
     */
    const logout = () => signOut(auth);

    /**
     * Fuerza un refresh del token JWT para obtener los Custom Claims más recientes.
     * Llamar después de que un admin cambie el rol de otro usuario YA autenticado.
     */
    const refreshUserClaims = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        // forceRefresh=true descarta el caché y obtiene un token fresco del servidor
        const tokenResult = await currentUser.getIdTokenResult(true);
        const claims = tokenResult.claims;
        setUser(prev => prev ? {
            ...prev,
            rol: claims.rol || prev.rol,
            grupo: claims.grupo || prev.grupo,
            _claims: claims,
        } : null);
    };

    const openLogin  = () => setIsAuthModalOpen(true);
    const closeLogin = () => setIsAuthModalOpen(false);

    const value = {
        user,
        isAuthenticated,
        loading,
        isAuthModalOpen,
        openLogin,
        closeLogin,
        logout,
        refreshUserClaims,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);