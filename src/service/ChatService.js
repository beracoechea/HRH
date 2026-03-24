// src/services/ChatService.js
const KNOWLEDGE_BASE = {
  requisitos: "Para un crédito en CrediGO necesitas: INE vigente, comprobante de domicilio y los últimos 3 meses de estados de cuenta.",
  horarios: "Nuestras oficinas están abiertas de Lunes a Viernes de 9:00 AM a 6:00 PM.",
  citas: "Puedes agendar una cita haciendo clic en el botón 'Agendar Cita' en la parte superior de la página.",
  contacto: "Puedes llamarnos al 55-1234-5678 o escribirnos a contacto@credigo.com",
  saludo: "¡Hola! Soy el asistente virtual de CrediGO. ¿En qué puedo ayudarte hoy?"
};

export const getBotResponse = async (userMessage) => {
  const msg = userMessage.toLowerCase();
  
  // Simulamos un retraso de red para el "typing indicator"
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (msg.includes("requisito") || msg.includes("necesito")) return KNOWLEDGE_BASE.requisitos;
  if (msg.includes("horario") || msg.includes("abierto")) return KNOWLEDGE_BASE.horarios;
  if (msg.includes("cita") || msg.includes("agendar")) return KNOWLEDGE_BASE.citas;
  if (msg.includes("hola") || msg.includes("buenos días")) return KNOWLEDGE_BASE.saludo;
  if (msg.includes("contacto") || msg.includes("telefono")) return KNOWLEDGE_BASE.contacto;

  return "Lo siento, no entiendo tu pregunta. ¿Podrías intentar con palabras como 'requisitos', 'citas' o 'contacto'?";
};