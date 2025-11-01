import React from 'react';
import { useTranslation } from 'react-i18next';
import './LocationPrompt.css';

const LocationPrompt = ({ onDismiss }) => {
  const { t } = useTranslation();

  return (
    <div className="location-prompt">
      <div className="location-prompt-content">
        <div className="location-prompt-icon">📍</div>
        <div className="location-prompt-text">
          <p className="location-prompt-title">{t('locationPrompt.detecting')}</p>
          <p className="location-prompt-subtitle">{t('locationPrompt.subtitle')}</p>
        </div>
        <button 
          className="location-prompt-dismiss"
          onClick={onDismiss}
          aria-label={t('locationPrompt.dismiss')}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default LocationPrompt;
