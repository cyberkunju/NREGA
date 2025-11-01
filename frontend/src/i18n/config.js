import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files directly
import enTranslations from '../locales/en/translation.json';
import hiTranslations from '../locales/hi/translation.json';
import teTranslations from '../locales/te/translation.json';
import taTranslations from '../locales/ta/translation.json';
import mrTranslations from '../locales/mr/translation.json';
import mlTranslations from '../locales/ml/translation.json';
import knTranslations from '../locales/kn/translation.json';
import guTranslations from '../locales/gu/translation.json';
import paTranslations from '../locales/pa/translation.json';
import orTranslations from '../locales/or/translation.json';
import asTranslations from '../locales/as/translation.json';
import lusTranslations from '../locales/lus/translation.json';
import mniTranslations from '../locales/mni/translation.json';
import neTranslations from '../locales/ne/translation.json';
import kokTranslations from '../locales/kok/translation.json';

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources: {
      en: { translation: enTranslations },
      hi: { translation: hiTranslations },
      te: { translation: teTranslations },
      ta: { translation: taTranslations },
      mr: { translation: mrTranslations },
      ml: { translation: mlTranslations },
      kn: { translation: knTranslations },
      gu: { translation: guTranslations },
      pa: { translation: paTranslations },
      or: { translation: orTranslations },
      as: { translation: asTranslations },
      lus: { translation: lusTranslations },
      mni: { translation: mniTranslations },
      ne: { translation: neTranslations },
      kok: { translation: kokTranslations }
    },
    fallbackLng: 'en',
    debug: false, // Set to true for debugging
    
    // Language detection order
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    
    // React-specific options
    react: {
      useSuspense: false, // Disable Suspense to avoid blocking render
    },
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    // Supported languages - All 15 Indian languages
    supportedLngs: ['en', 'hi', 'ta', 'te', 'ml', 'kn', 'mr', 'gu', 'pa', 'or', 'as', 'lus', 'mni', 'ne', 'kok'],
    
    // Namespace configuration
    ns: ['translation'],
    defaultNS: 'translation',
  });

export default i18n;
