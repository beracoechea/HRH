import { FirestoreService } from './FirestoreService';
import { db } from '../firebase/config';
import { 
    collection, query, where, getDocs, 
    orderBy, serverTimestamp, increment, arrayUnion 
} from 'firebase/firestore';

export class CreditService extends FirestoreService {
    constructor() {
        super('creditos');
    }

    getRequisitos(tipo) {
        const base = ['INE Vigente', 'Comprobante Domicilio', 'Situación Fiscal', 'CURP'];
        const specs = {
            'PERSONAL': ['Últimos 3 recibos de nómina'],
            'AUTOMOTRIZ': ['Carta de Ingresos', 'Cotización de Agencia']
        };
        return [...base, ...(specs[tipo?.toUpperCase()] || [])].map(nombre => ({
            tipo_documento: nombre,
            estatus: 'esperando',
            url: '',
            fecha_subida: null
        }));
    }

    crearSolicitud = async (userData, prestamoData, telefono) => {
        try {
            const expedienteInicial = this.getRequisitos(prestamoData.tipo_credito);
            
            const nuevaSolicitud = {
                usuario_id: userData.uid || userData.id || 'anonimo',
                usuario_nombre: userData.nombre || userData.displayName || 'Usuario Sin Nombre',
                usuario_email: userData.email || 'sin@email.com',
                tipo_credito: (prestamoData.tipo_credito || 'PERSONAL').toUpperCase(),
                monto_solicitado: Number(prestamoData.monto_solicitado) || 0, 
                plazo_meses: Number(prestamoData.plazo_meses) || 0,
                pago_quincenal_ano1: Number(prestamoData.pago_quincenal_ano1) || 0,
                pago_quincenal_ano2: Number(prestamoData.pago_quincenal_ano2) || 0,
                total_estimado: Number(prestamoData.total_estimado) || 0,
                telefono_contacto: telefono || 'Sin teléfono',
                estado: 'pendiente',
                frecuencia_pago: 'quincenal',
                pagado: 0,
                fase: 1,
                expediente: expedienteInicial,
                usuario_grupo: userData.grupo || null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                historialPagos: [] // Inicializar array de pagos
            };

            return await this.create(nuevaSolicitud);
        } catch (error) {
            console.error("Error crítico al crear solicitud:", error);
            throw error;
        }
    }

    getAll = async (grupo = null) => {
        try {
            let q = collection(db, this.collectionName);
            if (grupo) {
                q = query(q, where('usuario_grupo', '==', grupo), orderBy('createdAt', 'desc'));
            } else {
                q = query(q, orderBy('createdAt', 'desc'));
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error al obtener todos los créditos:", error);
            return [];
        }
    }

    getByUsuario = async (userId) => {
        try {
            const q = query(
                collection(db, this.collectionName),
                where("usuario_id", "==", userId),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error en CreditService.getByUsuario:", error);
            return [];
        }
    }

    updateStatus = async (id, payload) => {
        try {
            let targetId = id;
            let rawData = payload;

            if (typeof id === 'object' && id.creditoId) {
                targetId = id.creditoId;
                rawData = id;
            }

            if (!targetId) throw new Error("ID de crédito no proporcionado");

            let updateData = {
                updatedAt: serverTimestamp(),
                lastUpdate: serverTimestamp()
            };

            // CASO: REGISTRO DE ABONO (Nidado en el documento)
            if (rawData.montoAbono) {
                const abono = Number(rawData.montoAbono);
                if (isNaN(abono)) throw new Error("El monto del abono no es un número válido");
                
                updateData.pagado = increment(abono);
                updateData.montoAbono = abono; 
                updateData.adminId = rawData.adminId || 'sistema';

                // --- NUEVO: REGISTRO ANIDADO DE PAGO ---
                updateData.historialPagos = arrayUnion({
                    monto: abono,
                    fecha: new Date().toISOString(), // Usamos ISO String para facilitar la agregación cliente
                    adminId: updateData.adminId,
                    createdAt: new Date().toISOString()
                });
            }
            else if (rawData.montoTotalCorregido !== undefined) {
                const correccion = Number(rawData.montoTotalCorregido);
                updateData.pagado = correccion;
                updateData.montoTotalCorregido = correccion;
                updateData.adminId = rawData.adminId || 'sistema';
            }

            if (rawData.estado) {
                updateData.estado = rawData.estado;
            }

            return await this.update(targetId, updateData);

        } catch (error) {
            console.error("Error al actualizar crédito:", error);
            throw error;
        }
    }

    updateCredit = async (id, data) => {
        try {
            return await this.update(id, {
                ...data,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error al editar crédito:", error);
            throw error;
        }
    }
}