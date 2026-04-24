/**
 * src/api/creditApi.js
 *
 * Capa de API para operaciones privilegiadas sobre créditos.
 * Operaciones como cambio de fase, registro de pagos y cambio de estado
 * SOLO se procesan en el backend — el cliente no toca esos campos directamente.
 */
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

/**
 * Avanza o retrocede un crédito a una nueva fase del flujo.
 *
 * @param {string} creditoId  - ID del crédito en Firestore
 * @param {number} nuevaFase  - Número de fase destino
 */
export const actualizarFaseCredito = async (creditoId, nuevaFase) => {
    const fn = httpsCallable(functions, 'actualizarFaseCredito');
    const result = await fn({ creditoId, nuevaFase });
    return result.data;
};

/**
 * Registra un abono en el historial de pagos.
 * Solo tesoreros y admins pueden ejecutar esta acción.
 *
 * @param {string} creditoId  - ID del crédito
 * @param {number} montoAbono - Monto del pago en MXN
 */
export const registrarPago = async (creditoId, montoAbono) => {
    const fn = httpsCallable(functions, 'registrarPago');
    const result = await fn({ creditoId, montoAbono });
    return result.data;
};

/**
 * Cambia el estado de un crédito (pendiente, activo, liquidado, etc.)
 *
 * @param {string} creditoId - ID del crédito
 * @param {string} estado    - Nuevo estado
 */
export const actualizarEstadoCredito = async (creditoId, estado) => {
    const fn = httpsCallable(functions, 'actualizarEstadoCredito');
    const result = await fn({ creditoId, estado });
    return result.data;
};

/**
 * Emite el contrato digital via Mifiel para un crédito.
 *
 * @param {string} creditoId - ID del crédito
 */
export const emitirContrato = async (creditoId) => {
    const fn = httpsCallable(functions, 'emitirContrato');
    const result = await fn({ creditoId });
    return result.data;
};

/**
 * Dispara el análisis KYC con IA sobre los documentos del crédito.
 *
 * @param {string}   creditoId    - ID del crédito
 * @param {string}   usuarioId    - UID del usuario dueño
 * @param {string[]} documentUrls - URLs de los documentos a analizar
 */
export const analizarDocumentosKYC = async (creditoId, usuarioId, documentUrls) => {
    const fn = httpsCallable(functions, 'analizarDocumentosGenerales');
    const result = await fn({ creditoId, usuarioId, documentUrls });
    return result.data;
};

/**
 * Actualiza el estatus de uno o varios documentos en el expediente.
 * 
 * @param {string} creditoId - ID del crédito
 * @param {Array}  updates   - Arreglo de { nombreDoc, status, observaciones }
 */
export const actualizarEstadoDocumentos = async (creditoId, updates) => {
    const fn = httpsCallable(functions, 'actualizarEstadoDocumentos');
    const result = await fn({ creditoId, updates });
    return result.data;
};
