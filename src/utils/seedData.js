import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';

/**
 * SEEDER DE DATOS DE PRUEBA
 * Crea 1 RH, 2 Clientes Personal, 2 Clientes Automotriz
 */
export const seedTestData = async () => {
    console.log("Iniciando seeding...");
    
    try {
        // 1. CREAR RH (GRUPO A)
        const rhId = "test_rh_01";
        await setDoc(doc(db, "usuarios", rhId), {
            nombre: "RH - RECURSOS HUMANOS TEST",
            email: "rh_test@stratego.com",
            rol: "rh",
            grupo: "GRUPO ALPHA",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        const clientes = [
            { id: "c_pers_1", nombre: "CLIENTE PERSONAL 1", tipo: "PERSONAL", fase: 1 },
            { id: "c_pers_2", nombre: "CLIENTE PERSONAL 2", tipo: "PERSONAL", fase: 4 },
            { id: "c_auto_1", nombre: "CLIENTE AUTOMOTRIZ 1", tipo: "AUTOMOTRIZ", fase: 1 },
            { id: "c_auto_2", nombre: "CLIENTE AUTOMOTRIZ 2", tipo: "AUTOMOTRIZ", fase: 6 }
        ];

        for (const c of clientes) {
            // Documento de Usuario
            await setDoc(doc(db, "usuarios", c.id), {
                nombre: c.nombre,
                email: `${c.id}@test.com`,
                rol: "cliente",
                grupo: "GRUPO ALPHA",
                telefono: "5512345678",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // Crédito Asociado
            const creditId = `cred_${c.id}`;
            await setDoc(doc(db, "creditos", creditId), {
                usuario_id: c.id,
                usuario_nombre: c.nombre,
                usuario_email: `${c.id}@test.com`,
                usuario_grupo: "GRUPO ALPHA",
                monto_solicitado: c.tipo === 'PERSONAL' ? 25000 : 350000,
                tipo_credito: c.tipo,
                estado: c.fase >= 8 ? 'finalizado' : 'pendiente',
                fase: c.fase,
                historialPasos: [
                    { fase: 1, timestamp: new Date(), estimatedHours: 24 }
                ],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // Cita de cortesía
            await addDoc(collection(db, "citas"), {
                usuario_id: c.id,
                usuario_nombre: c.nombre,
                fecha: "2026-04-15",
                hora: "10:00",
                estado: "pendiente",
                grupo: "GRUPO ALPHA",
                createdAt: serverTimestamp()
            });
        }

        console.log("✅ Seeding completado exitosamente");
        return true;
    } catch (error) {
        console.error("❌ Error en seeding:", error);
        return false;
    }
};
