import { useState } from 'react';
import { db } from '../../firebase/config';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export const useMigration = () => {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    const migrateKYCData = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "creditos"));
            const total = querySnapshot.size;
            let current = 0;

            const promises = querySnapshot.docs.map(async (docSnapshot) => {
                const data = docSnapshot.data();
                const creditoId = docSnapshot.id;
                
                // Si ya tiene datos KYC, nos aseguramos que tengan los campos nuevos
                // de lo contrario, creamos un objeto básico si ya estaba completado
                if (data.datosKYC || data.statusKYC === 'completado') {
                    const currentKYC = data.datosKYC || {};
                    
                    const updatedKYC = {
                        ...currentKYC,
                        // Pre-llenado desde la raíz del crédito si no existían
                        telefono: currentKYC.telefono || data.telefono_contacto || 'Sin teléfono',
                        correo: currentKYC.correo || data.usuario_email || 'Sin correo',
                        paisNacimiento: currentKYC.paisNacimiento || 'MÉXICO',
                        entidadNacimiento: currentKYC.entidadNacimiento || ''
                    };

                    await updateDoc(doc(db, "creditos", creditoId), {
                        datosKYC: updatedKYC
                    });
                }
                
                current++;
                setProgress({ current, total });
            });

            await Promise.all(promises);
            setLoading(false);
            return { success: true, count: total };
        } catch (error) {
            console.error("Error en migración:", error);
            setLoading(false);
            return { success: false, error: error.message };
        }
    };

    return { migrateKYCData, loading, progress };
};
