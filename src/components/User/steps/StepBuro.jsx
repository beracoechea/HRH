import React, { useState } from 'react';
import { FiSearch, FiFileText, FiDownload, FiUploadCloud, FiCheckCircle, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { db, storage } from '../../../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import '../../../assets/styles/User/StepBuro.css';

export const StepBuro = ({ user, credito, onComplete }) => {
    const [uploading, setUploading] = useState(false);
    const [accepted, setAccepted] = useState(false);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);

        try {
            const path = `creditos/${credito.id}/autorizacion_buro_${Date.now()}_${file.name}`;
            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);

            const creditoRef = doc(db, "creditos", credito.id);
            await updateDoc(creditoRef, {
                fase: 3, // Avanza a Carga de Documentación
                expediente: arrayUnion({
                    nombre: 'Autorización de Buró Firmada',
                    url: url,
                    estatus: 'revision',
                    fecha_subida: new Date().toISOString(),
                    tipo_documento: 'buro'
                }),
                updatedAt: serverTimestamp()
            });

            if (onComplete) onComplete();
        } catch (error) {
            console.error(error);
            alert("Error al subir el archivo.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="buro-step-container animate-fade">
            <div className="step-icon-bg">
                <FiSearch />
            </div>
            <h2>Fase 2: Evaluación de Historial</h2>
            <p className="step-description">
                Autoriza la consulta de tu historial crediticio. Esto nos permite conocer tu perfil 
                para asignarte la tasa y el plazo más competitivos.
            </p>

            <div className="buro-actions-card">
                <div className="download-section">
                    <FiFileText className="doc-icon" />
                    <div className="doc-info">
                        <span>Formato de Autorización</span>
                        <small>Descarga, firma y vuelve a subir este documento.</small>
                    </div>
                    <a href="/formatos/autorizacion_buro.pdf" target="_blank" className="btn-download-buro">
                        <FiDownload /> Descargar
                    </a>
                </div>

                <div className="upload-section">
                    <label className="checkbox-confirm">
                        <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
                        <span>He firmado el documento y estoy listo para subirlo.</span>
                    </label>

                    <label className={`btn-upload-buro ${!accepted || uploading ? 'disabled' : ''}`}>
                        {uploading ? <FiLoader className="spinner" /> : <FiUploadCloud />}
                        <span>{uploading ? 'Subiendo...' : 'Subir Autorización Firmada'}</span>
                        <input type="file" hidden disabled={!accepted || uploading} onChange={handleUpload} accept=".pdf,.jpg,.jpeg,.png" />
                    </label>
                </div>
            </div>

            <div className="info-note">
                <FiAlertCircle />
                <p>Puedes firmar esta autorización de forma electrónica o física (escaneada).</p>
            </div>
        </div>
    );
};
