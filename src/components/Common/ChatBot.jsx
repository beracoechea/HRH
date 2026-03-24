/* src/components/Common/ChatBot.jsx */
import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiSend } from 'react-icons/fi';
import { useChatBot } from '../../pages/hooks/useChatBot';
import '../../assets/styles/ChatBot.css';
import logoChat from '../../assets/images/MovilRojo.png'; 

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const chatBodyRef = useRef(null);
  
  // Usamos nuestro cerebro (hook)
  const { messages, isTyping, sendMessage } = useChatBot();

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chat-window fade-in-bot">
          <div className="chat-header">
            <div className="header-info">
              <img src={logoChat} alt="bot" className="header-logo-mini" />
              <span>Credigo Chat</span>
            </div>
            <button className="close-btn-minimal" onClick={() => setIsOpen(false)}><FiX /></button>
          </div>

          <div className="chat-body" ref={chatBodyRef}>
            {messages.map((msg) => (
              <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                <div className={`message ${msg.sender}-msg`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message-wrapper bot">
                <div className="message bot-msg typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>

          <form className="chat-footer" onSubmit={handleSubmit}>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Hazme una pregunta completa..." 
              className="chat-input"
            />
            <button type="submit" className="chat-send-btn"><FiSend /></button>
          </form>
        </div>
      )}

      <button className="chat-bubble-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FiX className="close-icon-bubble" /> : <img src={logoChat} alt="Bot" className="chat-logo-img" />}
      </button>
    </div>
  );
};