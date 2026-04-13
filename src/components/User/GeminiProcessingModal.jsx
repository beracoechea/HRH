import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiCpu, FiFileText, FiCheck, FiLoader, FiZap } from 'react-icons/fi';
import './GeminiProcessingModal.css';

export const GeminiProcessingModal = ({ isOpen, currentStep = 0 }) => {
    const steps = [
        "Iniciando conexión con Redes Neuronales...",
        "Analizando Legibilidad de Documentos...",
        "Extrayendo Datos de Identificación (INE/RFC)...",
        "Validando Domicilio y Constancia Fiscal...",
        "Consolidando Perfil del Cliente...",
        "Finalizando Autocompletado..."
    ];

    const [subStep, setSubStep] = useState(0);

    useEffect(() => {
        if (!isOpen) {
            setSubStep(0);
            return;
        }

        const interval = setInterval(() => {
            setSubStep(prev => (prev + 1) % steps.length);
        }, 3500);

        return () => clearInterval(interval);
    }, [isOpen]);

    if (!isOpen) return null;

    // Usamos el portal para que no sea cortado por el overflow del componente padre
    return createPortal(
        <div className="gemini-modal-overlay">
            <div className="gemini-modal-card animate-pop">
                <div className="gemini-header">
                    <div className="gemini-ai-badge">
                        <FiZap className="zap-icon" /> <span>ANALIZANDO TUS DOCUMENTOS</span>
                    </div>
                </div>

                <div className="gemini-animation-container">
                    <div className="document-scanner">
                        <FiFileText className="doc-icon" />
                        <div className="scan-line"></div>
                        <div className="data-particles">
                            <span>0101</span><span>CURP</span><span>RFC</span><span>1010</span>
                        </div>
                    </div>
                </div>

                <div className="gemini-status-area">
                    <div className="loader-wrapper">
                        <FiLoader className="spinner-ai" />
                    </div>
                    <div className="typing-text">
                        <p>{steps[subStep]}</p>
                        <div className="typing-cursor"></div>
                    </div>
                </div>

                <div className="gemini-footer-info">
                    <p>Estamos convirtiendo tus imágenes en datos estructurados para agilizar tu crédito.</p>
                </div>
            </div>
        </div>,
        document.body
    );
};
