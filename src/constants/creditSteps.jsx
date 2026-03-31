import React from 'react';
import { 
  FiUserCheck, FiSearch, FiUploadCloud, FiActivity, 
  FiFileText, FiEdit3, FiShield, FiCheckCircle
} from 'react-icons/fi';

export const CREDIT_STEPS = [
  { 
    id: 1, 
    label: 'Perfil y preferencias (KYC)', 
    icon: <FiUserCheck />,
    description: "Comencemos con lo básico. Completa tu información personal y cuéntanos qué tipo de crédito necesitas para ofrecerte una solución a tu medida."
  },
  { 
    id: 2, 
    label: 'Evaluación de Historial', 
    icon: <FiSearch />,
    description: "Autoriza la consulta de tu historial crediticio. Esto nos permite conocer tu perfil para asignarte la tasa y el plazo más competitivos."
  },
  { 
    id: 3, 
    label: 'Carga de Documentación', 
    icon: <FiUploadCloud />,
    description: "Sube tus documentos de identidad, ingresos y domicilio. El sistema te guiará según el crédito que hayas elegido."
  },
  { 
    id: 4, 
    label: 'Procesamiento y análisis', 
    icon: <FiActivity />,
    description: "¡Estamos trabajando para ti! Nuestro equipo realiza las validaciones de seguridad y análisis de crédito necesarios."
  },
  { 
    id: 5, 
    label: 'Propuesta personalizada', 
    icon: <FiFileText />,
    description: "¡Tu propuesta está lista! Recibe tu cotización y tabla de amortización ajustada a tu perfil crediticio."
  },
  { 
    id: 6, 
    label: 'Formalización (Firma de Contrato)', 
    icon: <FiEdit3 />,
    description: "Firma tu contrato, pagaré y documentos finales de forma digital o física."
  },
  { 
    id: 7, 
    label: 'Verificación de datos', 
    icon: <FiShield />,
    description: "Realizamos una última validación de tus documentos y datos bancarios para asegurar el depósito."
  },
  { 
    id: 8, 
    label: '¡Desembolso Exitoso!', 
    icon: <FiCheckCircle />,
    description: "Tu solicitud ha sido enviada a tesorería. ¡Gracias por confiar en CrediGo!"
  }
];