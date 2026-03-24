// src/hooks/useChatBot.js
import { useState, useEffect, useCallback } from 'react';
import { getBotResponse } from '../../service/ChatService';

export const useChatBot = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "¡Hola! Bienvenido a CrediGO. ¿En qué puedo asesorarte hoy?", sender: 'bot' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(async (text) => {
    // 1. Agregar mensaje del usuario
    const userMsg = { id: Date.now(), text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);

    // 2. Mostrar que el bot está pensando
    setIsTyping(true);

    try {
      // 3. Obtener respuesta del servicio
      const botText = await getBotResponse(text);
      
      const botMsg = { id: Date.now() + 1, text: botText, sender: 'bot' };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg = { id: Date.now() + 1, text: "Ups, tuve un problema. Intenta de nuevo.", sender: 'bot' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  }, []);

  return {
    messages,
    isTyping,
    sendMessage
  };
};