/* src/pages/Dashboard/components/FaqSection/FaqSection.jsx */
import React, { useState } from 'react';
import { FiHelpCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import '../../../assets/styles/Home/FaqSection.css'; 

export const FaqSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // Datos completos con preguntas y respuestas
  const faqData = [
    {
      question: "¿Necesito antigüedad para acceder al credito?",
      answer: "Sí, para solicitar tu crédito requieres tener al menos 3 meses de antigüedad laborando con nosotros."
    },
    {
      question: "¿Cómo se realizan los descuentos a mi nómina?",
      answer: "Los descuentos son automáticos y se realizan vía nómina de forma quincenal, para que no tengas que preocuparte por fechas de pago."
    },
    {
      question: "¿Puedo adelantar pagos o liquidar antes el préstamos?",
      answer: "¡Claro que sí! Puedes realizar abonos a capital o liquidar tu préstamo anticipadamente sin ninguna penalización."
    },
    {
      question: "¿Cuánto tiempo tarda la autorización del préstamo?",
      answer: "Nuestro proceso es muy ágil. Una vez enviada tu solicitud, recibes respuesta en un lapso de 24 a 48 horas hábiles."
    }
  ];

  return (
    <section className="faq-section">
      <div className="faq-container">
        
        <div className="faq-header">
          <h2>¿Tienes dudas?</h2>
          <p>¡Tenemos una respuesta!</p>
          <FiHelpCircle className="faq-big-icon"/>
        </div>
        
        <div className="faq-list">
          {faqData.map((item, index) => (
            <div 
              key={index} 
              className={`faq-item ${activeIndex === index ? 'active' : ''}`}
              onClick={() => toggleFAQ(index)}
            >
              <div className="faq-question">
                <span>{item.question}</span>
                {activeIndex === index ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              
              <div className={`faq-answer ${activeIndex === index ? 'show' : ''}`}>
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};