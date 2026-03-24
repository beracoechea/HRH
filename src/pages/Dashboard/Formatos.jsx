import React from 'react';
import { FiEdit } from 'react-icons/fi';
import DocCard from '../../components/formatos/DocCard';
import styles from './Formatos.module.css';
import { FooterSection } from './components/FooterSection';
import {Expedientes} from '../../components/formatos/Expediente';

export const Formatos = () => {

  return (
    <div className={styles.mainContainer}>

      <Expedientes />

      <FooterSection />
    </div>
  );
};