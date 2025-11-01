import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './LoadingOverlay.css';

const LoadingOverlay = ({ message }) => {
  const { t } = useTranslation();
  const displayMessage = message || t('map.loadingMap');
  return (
    <motion.div
      className="loading-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="loading-content">
        <div className="loading-spinner">
          <svg className="spinner-svg" viewBox="0 0 50 50">
            <circle
              className="spinner-circle"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="3"
            />
          </svg>
        </div>
        <p className="loading-message">{displayMessage}</p>
      </div>
    </motion.div>
  );
};

export default LoadingOverlay;
