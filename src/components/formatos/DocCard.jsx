import React from 'react';
import { FiArrowDown } from 'react-icons/fi';
import styles from './DocCard.module.css';

const DocCard = ({ nombre, url }) => {
  return (
    <div className={styles.cardContainer}>
      <div className={styles.arrowWrapper}>
        <FiArrowDown strokeWidth={3} /> 
      </div>
      
    <a 
      href={url} 
      download={`${nombre}.pdf`} 
      className={styles.downloadButton}
    >
      {nombre}
    </a>
    </div>
  );
};

export default DocCard;