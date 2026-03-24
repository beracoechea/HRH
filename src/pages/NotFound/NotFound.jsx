/* src/pages/NotFound/NotFound.jsx */
import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import './NotFound.css';

import notFoundGif from '../../assets/images/logo_animado.gif'; 

export const NotFound = () => {
  
  return (
    <div className="page-content not-found-container">
      
      <h1 className="not-found-title">404</h1>
      <h2 className="not-found-subtitle">¡Ups! Página no encontrada</h2>
      
      <div className="gif-container">
        <img 
          src={notFoundGif} 
          alt="Animación 404" 
          className="not-found-gif" 
        />
      </div>

      <p className="not-found-text">
        Parece que la ruta que buscas no existe, inténtalo de nuevo.
      </p>

      <Link to="/" className="btn-home">
        <FiHome /> Regresar al Inicio
      </Link>
    </div>
  );
};