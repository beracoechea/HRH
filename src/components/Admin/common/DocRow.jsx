import React from 'react';
import { FiFileText, FiDownload } from 'react-icons/fi';

/**
 * Fila individual de documento en un expediente
 */
export const DocRow = ({ doc }) => {
    const statusClass = doc.estatus?.toLowerCase().trim().replace(/\s+/g, '_') || 'pendiente';

    return (
        <div className="doc-row">
            <div className="doc-info-mini">
                <FiFileText className="doc-icon" />
                <div>
                    <span className="name">{doc.nombre}</span>
                    <span className={`status ${statusClass}`}>{doc.estatus}</span>
                </div>
            </div>
            <div className="doc-actions">
                {doc.url && (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="btn-view">
                        <FiDownload />
                    </a>
                )}
            </div>
        </div>
    );
};
