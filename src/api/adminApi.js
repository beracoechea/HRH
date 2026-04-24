/**
 * src/api/adminApi.js
 *
 * Capa de API para operaciones administrativas privilegiadas.
 * Todas estas operaciones requieren Custom Claims válidos en el backend.
 * El frontend solo pasa datos — NUNCA verifica permisos por su cuenta.
 */
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

/**
 * Asigna un rol y grupo a un usuario existente.
 * Solo ejecutable por Super Admins (grupo === 'HRH').
 *
 * @param {string} uid       - UID del usuario a modificar
 * @param {string} nuevoRol  - Nuevo rol (admin, analista, cliente, etc.)
 * @param {string} [grupo]   - Grupo de la franquicia
 */
export const asignarRolUsuario = async (uid, nuevoRol, grupo = null) => {
    const fn = httpsCallable(functions, 'asignarRolUsuario');
    const result = await fn({ uid, nuevoRol, grupo });
    return result.data;
};

/**
 * Deshabilita el acceso de un usuario a la plataforma.
 *
 * @param {string} uid - UID del usuario a bloquear
 */
export const bloquearUsuario = async (uid) => {
    const fn = httpsCallable(functions, 'bloquearUsuario');
    const result = await fn({ uid });
    return result.data;
};

/**
 * Reactiva un usuario previamente bloqueado.
 *
 * @param {string} uid - UID del usuario a reactivar
 */
export const reactivarUsuario = async (uid) => {
    const fn = httpsCallable(functions, 'reactivarUsuario');
    const result = await fn({ uid });
    return result.data;
};

/**
 * Elimina permanentemente un usuario (borrado lógico en Firestore).
 * Solo Super Admins.
 *
 * @param {string} uid - UID del usuario a eliminar
 */
export const eliminarUsuario = async (uid) => {
    const fn = httpsCallable(functions, 'eliminarUsuario');
    const result = await fn({ uid });
    return result.data;
};

/**
 * Migración ONE-SHOT: asigna Custom Claims a todos los usuarios existentes.
 * Ejecutar una sola vez después del deploy inicial. Solo Super Admins.
 */
export const migrarCustomClaims = async () => {
    const fn = httpsCallable(functions, 'migrarCustomClaims');
    const result = await fn({});
    return result.data;
};
