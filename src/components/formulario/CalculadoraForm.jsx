import React, { useState } from 'react';
import { FiArrowRight, FiLock } from 'react-icons/fi';
import { useCalculadoraPrestamo } from '../../pages/hooks/useCalculadoraPrestamo';
import { useAuth } from '../../context/AuthContext'; 
import { SolicitudModal } from '../Modals/SolicitudModal';
import '../../assets/styles/Calculadora.css';

export const CalculadoraForm = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user, openLogin } = useAuth(); 
    
    const { 
        monto, setMonto, 
        plazo, setPlazo, 
        tipoCredito, setTipoCredito,
        reglas,
        pagoMensualAno1, 
        pagoMensualAno2, 
        totalPagarFinal,
        formatMoney 
    } = useCalculadoraPrestamo();

    // Lógica de quincenas sincronizada
    const quincenasTotales = (plazo || 0) * 2;
    const qAno1Calculado = quincenasTotales > 24 ? 24 : quincenasTotales;
    const qAno2Calculado = quincenasTotales > 24 ? quincenasTotales - 24 : 0;

    const handleOpenModal = () => {
        if (!user) {
            openLogin(); 
            return;
        }
        setIsModalOpen(true);
    };

    return (
        <div className="calculadora-wrapper">
            <div className="page-content calc-card">
                <div className="calc-header">
                    <h2>Simula tu Préstamo</h2>
                    <div className="tipo-credito-selector">
                        <button 
                            className={tipoCredito === 'personal' ? 'active' : ''} 
                            onClick={() => setTipoCredito('personal')}
                        > Personal </button>
                        <button 
                            className={tipoCredito === 'auto' ? 'active' : ''} 
                            onClick={() => setTipoCredito('auto')}
                        > Automotriz </button>
                    </div>
                </div>

                <div className="range-container">
                    <label className="calc-label">¿Cuánto necesitas?</label>
                    <div className="calc-amount-display">
                        {formatMoney(monto)} <span>MXN</span>
                    </div>
                    <input 
                        type="range" 
                        min={reglas.minMonto} 
                        max={reglas.maxMonto} 
                        step={tipoCredito === 'personal' ? 500 : 5000} 
                        value={monto}
                        onChange={(e) => setMonto(parseInt(e.target.value))}
                        className="styled-range"
                    />
                </div>

                <div className="range-container">
                    <label className="calc-label">Plazo: {plazo} meses ({quincenasTotales} quincenas)</label>
                    <input 
                        type="range" 
                        min={reglas.minPlazo} 
                        max={reglas.maxPlazo} 
                        step="1" 
                        value={plazo}
                        onChange={(e) => setPlazo(parseInt(e.target.value))}
                        className="styled-range"
                    />
                </div>

                <div className="calc-results">
                    <div className="result-row">
                        <span className="res-label">Pago Quincenal (Año 1)</span>
                        <span className="res-value">{formatMoney(pagoMensualAno1)}</span>
                    </div>

                    {plazo > 12 && (
                        <div className="result-row highlight-fidelidad">
                            <span className="res-label">Pago Quincenal (Año 2+)</span>
                            <span className="res-value text-green">{formatMoney(pagoMensualAno2)}</span>
                        </div>
                    )}

                    <div className="result-row total-row">
                        <span className="res-label">Total Final Estimado</span>
                        <span className="res-value">{formatMoney(totalPagarFinal)}</span>
                    </div>
                </div>

                <button className="btn-solicitar" onClick={handleOpenModal}>
                    {user ? <>Solicitar crédito <FiArrowRight /></> : <>Inicia sesión para continuar <FiLock /></>}
                </button>
            </div>

            {user && isModalOpen && (
               <SolicitudModal 
    isOpen={isModalOpen} 
    onClose={() => setIsModalOpen(false)}
    datosPrestamo={{
        // Valores numéricos para la base de datos
        montoReal: monto, 
        plazoMeses: plazo,
        totalPagar: totalPagarFinal,
        cuotaQuincenal1: pagoMensualAno1,
        cuotaQuincenal2: pagoMensualAno2,
        tipoLabel: tipoCredito.toUpperCase(),
        
        // Valores para la interfaz del modal (ya existentes)
        quincenasTotales: quincenasTotales,
        qAno1: qAno1Calculado,
        qAno2: qAno2Calculado,
        formatStrings: {
            monto: formatMoney(monto),
            pago1: formatMoney(pagoMensualAno1),
            pago2: formatMoney(pagoMensualAno2),
            total: formatMoney(totalPagarFinal)
        }
    }}
/>
            )}
        </div>
    );
};