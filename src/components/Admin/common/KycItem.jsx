import React from 'react';

/**
 * Item individual de KYC (editable o solo lectura)
 */
export const KycItem = ({ label, name, value, editing, type="text", onChange, icon }) => (
  <div className="kyc-item">
    <label>{icon} {label}</label>
    {editing ? (
        <input 
            type={type} 
            name={name} 
            value={value || ''} 
            onChange={onChange} 
            className="kyc-input-edit"
        />
    ) : (
        <p className="val">{value || '---'}</p>
    )}
  </div>
);
