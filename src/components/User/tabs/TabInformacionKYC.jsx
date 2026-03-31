import React from 'react';
import { FiUser, FiInfo } from 'react-icons/fi';
import { FormularioKYC } from '../../../components/User/FormularioKYC';

export const TabInformacionKYC = ({ user, onComplete }) => {
    return (
        <section className="kyc-standalone-container animate-fade">
            <div className="section-header-inline">
                <div>
                    <h2>Mi Información Personal</h2>
                    <p>Mantén tus datos actualizados para agilizar tus solicitudes legales.</p>
                </div>
            </div>

            <div className="info-banner-notice">
                <FiInfo />
                <span>Esta información es privada y se utiliza exclusivamente para fines de validación de identidad (KYC).</span>
            </div>

            <div className="kyc-form-wrapper">
                <FormularioKYC 
                    user={user} 
                    onComplete={onComplete} 
                />
            </div>
        </section>
    );
};