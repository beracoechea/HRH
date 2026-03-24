// src/hooks/core/useFirestoreOperation.js
import { useState, useCallback } from 'react';

export const useFirestoreOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState({ open: false, type: 'info', message: '' });

  const execute = useCallback(async (callback) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callback();
      setStatus({ 
        open: true, 
        type: 'success', 
        message: 'Operación exitosa' 
      });
      // Auto-cerrar mensaje
      setTimeout(() => setStatus(prev => ({ ...prev, open: false })), 3000);
      return result;
    } catch (err) {
      setError(err.message);
      setStatus({ 
        open: true, 
        type: 'error', 
        message: err.message 
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, status, setStatus, execute };
};