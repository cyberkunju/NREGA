import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSelection.css';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', available: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', available: true },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', available: true },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', available: true },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', available: true },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', available: false },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', available: false },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', available: false },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', available: false },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', available: false },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', available: false },
  { code: 'lus', name: 'Mizo', nativeName: 'Mizo', available: false },
  { code: 'mni', name: 'Manipuri', nativeName: 'মেইতেই লোন', available: false },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', available: false },
  { code: 'kok', name: 'Kokborok', nativeName: 'ককবরক', available: false }
];

const LanguageSelection = ({ onComplete }) => {
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLanguageSelect = async (languageCode, isAvailable) => {
    if (!isAvailable) {
      return; // Don't allow selection of unavailable languages
    }

    setSelectedLanguage(languageCode);
    setIsAnimating(true);

    // Change language
    await i18n.changeLanguage(languageCode);
    
    // Store preference
    localStorage.setItem('preferredLanguage', languageCode);
    localStorage.setItem('hasCompletedOnboarding', 'true');

    // Animate and complete
    setTimeout(() => {
      onComplete();
    }, 800);
  };

  return (
    <div className="language-selection-overlay">
      <div className={`language-selection-container ${isAnimating ? 'fade-out' : ''}`}>
        <div className="language-selection-header">
          <h1 className="language-selection-title">
            Welcome to MGNREGA Report Card
          </h1>
          <p className="language-selection-subtitle">
            Choose your preferred language / अपनी भाषा चुनें
          </p>
        </div>

        <div className="language-grid">
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              className={`language-button ${selectedLanguage === language.code ? 'selected' : ''} ${!language.available ? 'coming-soon' : ''}`}
              onClick={() => handleLanguageSelect(language.code, language.available)}
              disabled={isAnimating || !language.available}
              title={!language.available ? 'Coming Soon' : ''}
            >
              <span className="language-native-name">{language.nativeName}</span>
              <span className="language-english-name">{language.name}</span>
              {!language.available && (
                <span className="coming-soon-badge">Coming Soon</span>
              )}
            </button>
          ))}
        </div>

        <div className="language-selection-footer">
          <p className="language-selection-note">
            Currently available: English, हिन्दी, தமிழ், తెలుగు, मराठी • More languages coming soon!
          </p>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelection;
